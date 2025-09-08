import Event from "../models/Event.js";
import { uploadImage, deleteImageByUrl } from "../services/cloudinary.js";

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
        let images = [];
        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map((f) => uploadImage(f.buffer, "somos/event", f.mimetype))
            );
            images = uploads.map(u => u.url);
        }
        const newEvent = new Event({ ...req.body, images });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: "Error al crear evento", error: err.message });
    }
}

export async function updateEvent(req, res) {
    try {
        const existing = await Event.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Evento no encontrado" });

        // Permitir limpiar imágenes sin subir nuevas
        const removeAllFlag = String(req.body.removeAllImages || "").toLowerCase() === "true";
        let imagesField = req.body.images;
        if (typeof imagesField === "string") {
            try {
                const parsed = JSON.parse(imagesField);
                imagesField = Array.isArray(parsed) ? parsed : imagesField;
            } catch {
                // no-op si no es JSON
            }
        }
        const wantsEmptyImages = Array.isArray(imagesField) && imagesField.length === 0;

        if ((removeAllFlag || wantsEmptyImages) && (!req.files || req.files.length === 0)) {
            if (Array.isArray(existing.images) && existing.images.length > 0) {
                await Promise.all(existing.images.map((url) => deleteImageByUrl(url)));
            }
            const updated = await Event.findByIdAndUpdate(
                req.params.id,
                { $set: { images: [] } },
                { new: true }
            );
            return res.json(updated);
        }

        // Si hay archivos nuevos, elimina todas las imágenes anteriores y reemplaza
        if (req.files && req.files.length > 0) {
            if (Array.isArray(existing.images) && existing.images.length > 0) {
                await Promise.all(existing.images.map((url) => deleteImageByUrl(url)));
            }
            const uploads = await Promise.all(
                req.files.map((f) => uploadImage(f.buffer, "somos/event", f.mimetype))
            );
            req.body.images = uploads.map(u => u.url);
        }

        const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Evento no encontrado" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Error al actualizar evento", error: err.message });
    }
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
