import Program from "../models/Program.js";
import { uploadImage, deleteImageByUrl } from "../services/cloudinary.js";
import { normalizeFormData, validateFiles, FIELD_CONFIGS } from "../utils/validation.js";
import { handleEntityCreate, handleEntityUpdate } from "../utils/controllerUtils.js";

// Normaliza campos específicos de Program
function normalizeProgramBody(body) {
    return normalizeFormData(body, FIELD_CONFIGS.program);
}

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
    return handleEntityCreate(Program, req, res, {
        entityName: 'Programa',
        cloudinaryFolder: 'somos/program',
        normalizeFunction: normalizeProgramBody
    });
}

export async function updateProgram(req, res) {
    return handleEntityUpdate(Program, req, res, {
        entityName: 'Programa',
        cloudinaryFolder: 'somos/program',
        normalizeFunction: normalizeProgramBody
    });
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
