import Event from "../models/Event.js";

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
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: "Error al crear evento", error: err.message });
    }
}

export async function updateEvent(req, res) {
    try {
        const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Evento no encontrado" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Error al actualizar evento", error: err.message });
    }
}

export async function deleteEvent(req, res) {
    try {
        const deleted = await Event.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Evento no encontrado" });
        res.json({ message: "Evento eliminado" });
    } catch (err) {
        res.status(500).json({ message: "Error al eliminar evento", error: err.message });
    }
}
