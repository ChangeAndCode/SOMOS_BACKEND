import Testimony from "../models/Testimony.js";
import { 
    handleEntityCreate, 
    handleEntityUpdate, 
    handleEntityDelete, 
    handleGetAllEntities, 
    handleGetEntityById 
} from "../utils/controllerUtils.js";
import { normalizeFormData, FIELD_CONFIGS } from "../utils/validation.js";

function normalizeTestimonyBody(body) {
    return normalizeFormData(body, FIELD_CONFIGS.testimony || {});
}

export async function getAllTestimonies(req, res) {
    return handleGetAllEntities(Testimony, req, res, {
        entityName: 'Testimonio',
        populate: 'project program'
    });
}

export async function getTestimonyById(req, res) {
    return handleGetEntityById(Testimony, req, res, {
        entityName: 'Testimonio',
        populate: 'project program'
    });
}

export async function createTestimony(req, res) {
    return handleEntityCreate(Testimony, req, res, {
        entityName: 'Testimonio',
        cloudinaryFolder: 'somos/testimony',
        normalizeFunction: normalizeTestimonyBody
    });
}

export async function updateTestimony(req, res) {
    return handleEntityUpdate(Testimony, req, res, {
        entityName: 'Testimonio',
        cloudinaryFolder: 'somos/testimony',
        normalizeFunction: normalizeTestimonyBody
    });
}

export async function deleteTestimony(req, res) {
    return handleEntityDelete(Testimony, req, res, {
        entityName: 'Testimonio'
    });
}