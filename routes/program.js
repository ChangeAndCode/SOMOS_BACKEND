import express from "express";
import {
    getAllPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram
} from "../controllers/program.js";
import { authMiddleware } from "../middlewares/auth.js";
import { uploadMultipleImages } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getAllPrograms);
router.get("/:id", getProgramById);
router.post("/", authMiddleware, uploadMultipleImages, createProgram);
router.put("/:id", authMiddleware, uploadMultipleImages, updateProgram);
router.delete("/:id", authMiddleware, deleteProgram);

export default router;
