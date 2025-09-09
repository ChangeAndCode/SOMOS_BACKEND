import Event from "../models/Event.js";
import { normalizeFormData, FIELD_CONFIGS } from "../utils/validation.js";
import { 
    handleEntityCreate, 
    handleEntityUpdate, 
    handleEntityDelete, 
    handleGetAllEntities, 
    handleGetEntityById 
} from "../utils/controllerUtils.js";

function normalizeEventBody(body) {
    return normalizeFormData(body, FIELD_CONFIGS.event);
}

export async function getAllEvents(req, res) {
    return handleGetAllEntities(Event, req, res, {
        entityName: 'Evento'
    });
}

export async function getEventById(req, res) {
    return handleGetEntityById(Event, req, res, {
        entityName: 'Evento'
    });
}

export async function createEvent(req, res) {
    return handleEntityCreate(Event, req, res, {
        entityName: 'Evento',
        cloudinaryFolder: 'somos/event',
        normalizeFunction: normalizeEventBody
    });
}

export async function updateEvent(req, res) {
    return handleEntityUpdate(Event, req, res, {
        entityName: 'Evento',
        cloudinaryFolder: 'somos/event',
        normalizeFunction: normalizeEventBody
    });
}

export async function deleteEvent(req, res) {
    return handleEntityDelete(Event, req, res, {
        entityName: 'Evento'
    });
}
