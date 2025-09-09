import Program from "../models/Program.js";
import { uploadImage, deleteImageByUrl } from "../services/cloudinary.js";
import { normalizeFormData, validateFiles, FIELD_CONFIGS } from "../utils/validation.js";
import { handleEntityCreate, handleEntityUpdate, handleEntityDelete } from "../utils/controllerUtils.js";

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
    return handleEntityDelete(Program, req, res, {
        entityName: 'Programa'
    });
}
