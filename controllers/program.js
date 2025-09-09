import Program from "../models/Program.js";
import { normalizeFormData, FIELD_CONFIGS } from "../utils/validation.js";
import { 
    handleEntityCreate, 
    handleEntityUpdate, 
    handleEntityDelete, 
    handleGetAllEntities, 
    handleGetEntityById 
} from "../utils/controllerUtils.js";

// Normaliza campos específicos de Program
function normalizeProgramBody(body) {
    return normalizeFormData(body, FIELD_CONFIGS.program);
}

export async function getAllPrograms(req, res) {
    return handleGetAllEntities(Program, req, res, {
        entityName: 'Programa'
    });
}

export async function getProgramById(req, res) {
    return handleGetEntityById(Program, req, res, {
        entityName: 'Programa'
    });
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
