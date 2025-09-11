import express from "express";
import {
    getAllTestimonies,
    getTestimonyById,
    createTestimony,
    updateTestimony,
    deleteTestimony
} from "../controllers/testimony.js";
import { authMiddleware } from "../middlewares/auth.js";
import { uploadMultipleImages } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getAllTestimonies);
router.get("/:id", getTestimonyById);
router.post("/", authMiddleware, uploadMultipleImages, createTestimony);
router.put("/:id", authMiddleware, uploadMultipleImages, updateTestimony);
router.delete("/:id", authMiddleware, deleteTestimony);

export default router;
