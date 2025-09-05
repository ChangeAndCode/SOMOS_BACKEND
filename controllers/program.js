import Program from "../models/Program.js";

export async function getAllPrograms(req, res) {
    try {
        const programs = await Program.find();
        res.json(programs);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener programas", error: err.message });
    }
}

export async function getProgramById(req, res) {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) return res.status(404).json({ message: "Programa no encontrado" });
        res.json(program);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener programa", error: err.message });
    }
}

export async function createProgram(req, res) {
    try {
        const newProgram = new Program(req.body);
        await newProgram.save();
        res.status(201).json(newProgram);
    } catch (err) {
        res.status(400).json({ message: "Error al crear programa", error: err.message });
    }
}

export async function updateProgram(req, res) {
    try {
        const updated = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Programa no encontrado" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Error al actualizar programa", error: err.message });
    }
}

export async function deleteProgram(req, res) {
    try {
        const deleted = await Program.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Programa no encontrado" });
        res.json({ message: "Programa eliminado" });
    } catch (err) {
        res.status(500).json({ message: "Error al eliminar programa", error: err.message });
    }
}
