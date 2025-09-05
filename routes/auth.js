import express from "express";
import { loginUser, getProfile } from "../controllers/auth.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", authMiddleware, getProfile); // Ruta protegida

export default router;
