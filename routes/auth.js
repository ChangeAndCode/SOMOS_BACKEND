import express from "express";
import { loginUser, getProfile, registerUser } from "../controllers/auth.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", authMiddleware, getProfile); // Ruta protegida
router.post("/register", registerUser);

export default router;
