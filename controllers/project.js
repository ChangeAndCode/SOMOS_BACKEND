import Project from "../models/Project.js";

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
        const newProject = new Project(req.body);
        await newProject.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ message: "Error al crear proyecto", error: err.message });
    }
}

export async function updateProject(req, res) {
    try {
        const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Proyecto no encontrado" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Error al actualizar proyecto", error: err.message });
    }
}

export async function deleteProject(req, res) {
    try {
        const deleted = await Project.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Proyecto no encontrado" });
        res.json({ message: "Proyecto eliminado" });
    } catch (err) {
        res.status(500).json({ message: "Error al eliminar proyecto", error: err.message });
    }
}
