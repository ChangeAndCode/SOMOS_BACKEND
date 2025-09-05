import express from "express";
import {
    getAllTestimonies,
    getTestimonyById,
    createTestimony,
    updateTestimony,
    deleteTestimony
} from "../controllers/testimony.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllTestimonies);
router.get("/:id", getTestimonyById);
router.post("/", authMiddleware, createTestimony);
router.put("/:id", authMiddleware, updateTestimony);
router.delete("/:id", authMiddleware, deleteTestimony);

export default router;
