import Project from "../models/Project.js";
import { uploadImage, deleteImageByUrl } from "../services/cloudinary.js";
import { normalizeFormData, validateFiles, FIELD_CONFIGS } from "../utils/validation.js";
import { handleEntityCreate, handleEntityUpdate } from "../utils/controllerUtils.js";

// Normaliza campos específicos de Project
function normalizeProjectBody(body) {
    return normalizeFormData(body, FIELD_CONFIGS.project);
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
    return handleEntityCreate(Project, req, res, {
        entityName: 'Proyecto',
        cloudinaryFolder: 'somos/project',
        normalizeFunction: normalizeProjectBody
    });
}

export async function updateProject(req, res) {
    return handleEntityUpdate(Project, req, res, {
        entityName: 'Proyecto',
        cloudinaryFolder: 'somos/project',
        normalizeFunction: normalizeProjectBody
    });
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
