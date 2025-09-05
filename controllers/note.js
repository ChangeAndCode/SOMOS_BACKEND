import Note from "../models/Note.js";

export async function getAllNotes(req, res) {
    try {
        const notes = await Note.find();
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener notas", error: err.message });
    }
}

export async function getNoteById(req, res) {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: "Nota no encontrada" });
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener nota", error: err.message });
    }
}

export async function createNote(req, res) {
    try {
        const newNote = new Note(req.body);
        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(400).json({ message: "Error al crear nota", error: err.message });
    }
}

export async function updateNote(req, res) {
    try {
        const updated = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Nota no encontrada" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Error al actualizar nota", error: err.message });
    }
}

export async function deleteNote(req, res) {
    try {
        const deleted = await Note.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Nota no encontrada" });
        res.json({ message: "Nota eliminada" });
    } catch (err) {
        res.status(500).json({ message: "Error al eliminar nota", error: err.message });
    }
}
