import Project from "../models/Project.js";
import { uploadImage, deleteImageByUrl } from "../services/cloudinary.js";
import { normalizeFormData, validateFiles, FIELD_CONFIGS } from "../utils/validation.js";
import { handleEntityCreate, handleEntityUpdate, handleEntityDelete } from "../utils/controllerUtils.js";

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
    return handleEntityDelete(Project, req, res, {
        entityName: 'Proyecto'
    });
}
