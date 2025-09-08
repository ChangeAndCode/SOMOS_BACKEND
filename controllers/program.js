import Program from "../models/Program.js";
import { uploadImage, deleteImageByUrl } from "../services/cloudinary.js";

export async function getAllPrograms(req, res) {
    try {
        const programs = await Program.find();
        res.json(programs);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener programas", error: err.message });
    }
}

export async function getProgramById(req, res) {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) return res.status(404).json({ message: "Programa no encontrado" });
        res.json(program);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener programa", error: err.message });
    }
}

export async function createProgram(req, res) {
    try {
        let images = [];
        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map((f) => uploadImage(f.buffer, "somos/program", f.mimetype))
            );
            images = uploads.map(u => u.url);
        }
        const newProgram = new Program({ ...req.body, images });
        await newProgram.save();
        res.status(201).json(newProgram);
    } catch (err) {
        res.status(400).json({ message: "Error al crear programa", error: err.message });
    }
}

export async function updateProgram(req, res) {
    try {
        const existing = await Program.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Programa no encontrado" });

        // Permitir limpiar imágenes sin subir nuevas
        const removeAllFlag = String(req.body.removeAllImages || "").toLowerCase() === "true";
        let imagesField = req.body.images;
        if (typeof imagesField === "string") {
            try {
                const parsed = JSON.parse(imagesField);
                imagesField = Array.isArray(parsed) ? parsed : imagesField;
            } catch {
                // si no es JSON válido, lo tratamos como string normal
            }
        }
        const wantsEmptyImages = Array.isArray(imagesField) && imagesField.length === 0;

        if ((removeAllFlag || wantsEmptyImages) && (!req.files || req.files.length === 0)) {
            if (Array.isArray(existing.images) && existing.images.length > 0) {
                await Promise.all(existing.images.map((url) => deleteImageByUrl(url)));
            }
            const updated = await Program.findByIdAndUpdate(
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
                req.files.map((f) => uploadImage(f.buffer, "somos/program", f.mimetype))
            );
            const uploadedUrls = uploads.map(u => u.url);

            // Borrar en Cloudinary solo las que ya no están en keepImages
            const toDelete = (existing.images || []).filter((url) => !keepImages.includes(url));
            if (toDelete.length > 0) {
                await Promise.all(toDelete.map((url) => deleteImageByUrl(url)));
            }

            req.body.images = [...keepImages, ...uploadedUrls];
        } else {
            // Sin nuevas: si el cliente envió lista, sincroniza y borra las que ya no están
            if (Array.isArray(keepImages)) {
                const toDelete = (existing.images || []).filter((url) => !keepImages.includes(url));
                if (toDelete.length > 0) {
                    await Promise.all(toDelete.map((url) => deleteImageByUrl(url)));
                }
                req.body.images = keepImages;
            }
        }

        const updated = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Programa no encontrado" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Error al actualizar programa", error: err.message });
    }
}

export async function deleteProgram(req, res) {
    try {
        const existing = await Program.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Programa no encontrado" });

        if (Array.isArray(existing.images) && existing.images.length > 0) {
            await Promise.all(existing.images.map((url) => deleteImageByUrl(url)));
        }

        const deleted = await Program.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Programa no encontrado" });
        res.json({ message: "Programa eliminado" });
    } catch (err) {
        res.status(500).json({ message: "Error al eliminar programa", error: err.message });
    }
}
