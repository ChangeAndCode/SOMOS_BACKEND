import Note from "../models/Note.js";
import cloudinary from "../services/cloudinary.js";
import { 
    handleEntityCreate, 
    handleEntityUpdate, 
    handleEntityDelete, 
    handleGetAllEntities, 
    handleGetEntityById 
} from "../utils/controllerUtils.js";
import { normalizeFormData, FIELD_CONFIGS } from "../utils/validation.js";

function normalizeNoteBody(body) {
    return normalizeFormData(body, FIELD_CONFIGS.note || {});
}

export async function getAllNotes(req, res) {
    return handleGetAllEntities(Note, req, res, {
        entityName: 'Nota',
        populate: 'author' 
    });
}

export async function getNoteById(req, res) {
    return handleGetEntityById(Note, req, res, {
        entityName: 'Nota',
        populate: 'author'
    });
}

export async function createNote(req, res) {
    return handleEntityCreate(Note, req, res, {
        entityName: 'Nota',
        cloudinaryFolder: 'somos/note',
        normalizeFunction: normalizeNoteBody
    });
}

export async function updateNote(req, res) {
    return handleEntityUpdate(Note, req, res, {
        entityName: 'Nota',
        cloudinaryFolder: 'somos/note',
        normalizeFunction: normalizeNoteBody
    });
}

export async function deleteNote(req, res) {
    return handleEntityDelete(Note, req, res, {
        entityName: 'Nota'
    });
}