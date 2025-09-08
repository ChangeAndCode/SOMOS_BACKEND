import express from "express";
import {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
} from "../controllers/project.js";
import { authMiddleware } from "../middlewares/auth.js";
import { uploadMultipleImages } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", authMiddleware, uploadMultipleImages, createProject);
router.put("/:id", authMiddleware, uploadMultipleImages, updateProject);
router.delete("/:id", authMiddleware, deleteProject);

export default router;
