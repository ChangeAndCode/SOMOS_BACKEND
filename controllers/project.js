import Project from "../models/Project.js";
import { uploadImage, deleteImageByUrl } from "../services/cloudinary.js";

// Normaliza campos que llegan como string vía FormData
function normalizeProjectBody(body) {
    const normalized = { ...body };

    // programs puede llegar como string JSON o coma-separado
    if (typeof normalized.programs === "string") {
        try {
            const parsed = JSON.parse(normalized.programs);
            if (Array.isArray(parsed)) normalized.programs = parsed;
            else normalized.programs = String(normalized.programs).split(",").map(s => s.trim()).filter(Boolean);
        } catch {
            normalized.programs = String(normalized.programs).split(",").map(s => s.trim()).filter(Boolean);
        }
    }
    if (normalized.programs && !Array.isArray(normalized.programs)) {
        normalized.programs = [normalized.programs];
    }

    // Fechas
    if (typeof normalized.startDate === "string" && normalized.startDate) {
        normalized.startDate = new Date(normalized.startDate);
    }
    if (typeof normalized.endDate === "string" && normalized.endDate) {
        normalized.endDate = new Date(normalized.endDate);
    }

    return normalized;
}

export async function getAllProjects(req, res) {
    try {
        const projects = await Project.find().populate("programs");
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener proyectos", error: err.message });
    }
}

export async function getProjectById(req, res) {
    try {
        const project = await Project.findById(req.params.id).populate("programs");
        if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener proyecto", error: err.message });
    }
}

export async function createProject(req, res) {
    try {
        const payload = normalizeProjectBody(req.body);
        let images = [];
        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map((f) => uploadImage(f.buffer, "somos/project", f.mimetype))
            );
            images = uploads.map(u => u.url);
        }

        const newProject = new Project({ ...payload, images });
        await newProject.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ message: "Error al crear proyecto", error: err.message });
    }
}

export async function updateProject(req, res) {
    try {
        const existing = await Project.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Proyecto no encontrado" });

        const payload = normalizeProjectBody(req.body);
        // Permitir limpiar imágenes sin subir nuevas
        const removeAllFlag = String(payload.removeAllImages || "").toLowerCase() === "true";
        let imagesField = payload.images;
        if (typeof imagesField === "string") {
            try {
                const parsed = JSON.parse(imagesField);
                imagesField = Array.isArray(parsed) ? parsed : imagesField;
            } catch {
                // no-op si no es JSON
            }
        }
        const wantsEmptyImages = Array.isArray(imagesField) && imagesField.length === 0;

        if ((removeAllFlag || wantsEmptyImages) && (!req.files || req.files.length === 0)) {
            if (Array.isArray(existing.images) && existing.images.length > 0) {
                await Promise.all(existing.images.map((url) => deleteImageByUrl(url)));
            }
            const updated = await Project.findByIdAndUpdate(
                req.params.id,
                { $set: { images: [] } },
                { new: true }
            );
            return res.json(updated);
        }
        // Normalizar lista de imágenes a conservar desde el body (si viene)
        let keepImages = Array.isArray(imagesField) ? imagesField : (existing.images || []);

        // Subir nuevas y concatenar sin borrar las que se conservan
        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map((f) => uploadImage(f.buffer, "somos/project", f.mimetype))
            );
            const uploadedUrls = uploads.map(u => u.url);

            // Borrar en Cloudinary solo las que ya no están en keepImages
            const toDelete = (existing.images || []).filter((url) => !keepImages.includes(url));
            if (toDelete.length > 0) {
                await Promise.all(toDelete.map((url) => deleteImageByUrl(url)));
            }

            payload.images = [...keepImages, ...uploadedUrls];
        } else {
            // Sin nuevas: si el cliente envió lista, sincroniza y borra las que ya no están
            if (Array.isArray(keepImages)) {
                const toDelete = (existing.images || []).filter((url) => !keepImages.includes(url));
                if (toDelete.length > 0) {
                    await Promise.all(toDelete.map((url) => deleteImageByUrl(url)));
                }
                payload.images = keepImages;
            }
        }

        const updated = await Project.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!updated) return res.status(404).json({ message: "Proyecto no encontrado" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Error al actualizar proyecto", error: err.message });
    }
}

export async function deleteProject(req, res) {
    try {
        const existing = await Project.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Proyecto no encontrado" });

        if (Array.isArray(existing.images) && existing.images.length > 0) {
            await Promise.all(existing.images.map((url) => deleteImageByUrl(url)));
        }

        const deleted = await Project.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Proyecto no encontrado" });
        res.json({ message: "Proyecto eliminado" });
    } catch (err) {
        res.status(500).json({ message: "Error al eliminar proyecto", error: err.message });
    }
}
