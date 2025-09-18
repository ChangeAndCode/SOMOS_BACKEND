import User from "../models/User.js";
import bcrypt from "bcrypt";

export async function getAllUsers(req, res) {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener usuarios", error: err.message });
    }
}

export async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener usuario", error: err.message });
    }
}

export async function createUser(req, res) {
    try {
        const { password, ...rest } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ ...rest, passwordHash });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: "Error al crear usuario", error: err.message });
    }
}

export async function updateUser(req, res) {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Error al actualizar usuario", error: err.message });
    }
}

export async function deleteUser(req, res) {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json({ message: "Usuario eliminado" });
    } catch (err) {
        res.status(500).json({ message: "Error al eliminar usuario", error: err.message });
    }
}
