import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Error en login", error: err.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener perfil", error: err.message });
  }
}

export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validar que no exista
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = new User({ name, email, passwordHash });
    await newUser.save();

    // Crear token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al registrar usuario", error: err.message });
  }
}