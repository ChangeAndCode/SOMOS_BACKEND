import express from "express";
import { sendEmail, getVolunteers } from "../controllers/sumate.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Ruta pública para registro de voluntarios
router.post("/register", sendEmail);

// Rutas protegidas para administradores
router.get("/volunteers", authMiddleware, getVolunteers);


export default router;
