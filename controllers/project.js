import Project from "../models/Project.js";
import { normalizeFormData, FIELD_CONFIGS } from "../utils/validation.js";
import { 
    handleEntityCreate, 
    handleEntityUpdate, 
    handleEntityDelete, 
    handleGetAllEntities, 
    handleGetEntityById 
} from "../utils/controllerUtils.js";

function normalizeProjectBody(body) {
    return normalizeFormData(body, FIELD_CONFIGS.project);
}

export async function getAllProjects(req, res) {
    return handleGetAllEntities(Project, req, res, {
        entityName: 'Proyecto',
        populate: 'programs'
    });
}

export async function getProjectById(req, res) {
    return handleGetEntityById(Project, req, res, {
        entityName: 'Proyecto',
        populate: 'programs'
    });
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
