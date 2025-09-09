import Event from "../models/Event.js";
import { uploadImage, deleteImageByUrl } from "../services/cloudinary.js";
import { normalizeFormData, validateFiles, FIELD_CONFIGS } from "../utils/validation.js";
import { handleEntityCreate, handleEntityUpdate } from "../utils/controllerUtils.js";

// Normaliza campos específicos de Event
function normalizeEventBody(body) {
    return normalizeFormData(body, FIELD_CONFIGS.event);
}

export async function getAllEvents(req, res) {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener eventos", error: err.message });
    }
}

export async function getEventById(req, res) {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Evento no encontrado" });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener evento", error: err.message });
    }
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
    try {
        const existing = await Event.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Evento no encontrado" });

        if (Array.isArray(existing.images) && existing.images.length > 0) {
            await Promise.all(existing.images.map((url) => deleteImageByUrl(url)));
        }

        const deleted = await Event.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Evento no encontrado" });
        res.json({ message: "Evento eliminado" });
    } catch (err) {
        res.status(500).json({ message: "Error al eliminar evento", error: err.message });
    }
}
