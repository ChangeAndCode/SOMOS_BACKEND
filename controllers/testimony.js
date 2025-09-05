import Testimony from "../models/Testimony.js";

export async function getAllTestimonies(req, res) {
    try {
        const testimonies = await Testimony.find();
        res.json(testimonies);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener testimonios", error: err.message });
    }
}

export async function getTestimonyById(req, res) {
    try {
        const testimony = await Testimony.findById(req.params.id);
        if (!testimony) return res.status(404).json({ message: "Testimonio no encontrado" });
        res.json(testimony);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener testimonio", error: err.message });
    }
}

export async function createTestimony(req, res) {
    try {
        const newTestimony = new Testimony(req.body);
        await newTestimony.save();
        res.status(201).json(newTestimony);
    } catch (err) {
        res.status(400).json({ message: "Error al crear testimonio", error: err.message });
    }
}

export async function updateTestimony(req, res) {
    try {
        const updated = await Testimony.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Testimonio no encontrado" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Error al actualizar testimonio", error: err.message });
    }
}

export async function deleteTestimony(req, res) {
    try {
        const deleted = await Testimony.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Testimonio no encontrado" });
        res.json({ message: "Testimonio eliminado" });
    } catch (err) {
        res.status(500).json({ message: "Error al eliminar testimonio", error: err.message });
    }
}