import express from "express";
import {
    getAllNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
} from "../controllers/note.js";
import { authMiddleware } from "../middlewares/auth.js";
import { uploadMultipleImages } from "../middlewares/upload.js";

const router = express.Router();

router.use(authMiddleware); // protege todas las rutas

router.get("/", getAllNotes);
router.get("/:id", getNoteById);
router.post("/", uploadMultipleImages, createNote);
router.put("/:id", uploadMultipleImages, updateNote);
router.delete("/:id", deleteNote);

export default router;