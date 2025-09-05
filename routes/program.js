import express from "express";
import {
    getAllPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram
} from "../controllers/program.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllPrograms);
router.get("/:id", getProgramById);
router.post("/", authMiddleware, createProgram);
router.put("/:id", authMiddleware, updateProgram);
router.delete("/:id", authMiddleware, deleteProgram);

export default router;
