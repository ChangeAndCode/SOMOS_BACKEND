import express from "express";
import {
    getAllCollaborators,
    getCollaboratorById,
    createCollaborator,
    updateCollaborator,
    deleteCollaborator
} from "../controllers/collaborator.js";
import { authMiddleware } from "../middlewares/auth.js";
import multer from "multer";

const router = express.Router();

// Configurar multer para manejo de imagen única
const storage = multer.memoryStorage();
const allowedImages = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function imageFilter(req, file, cb) {
  if (allowedImages.has(file.mimetype)) return cb(null, true);
  cb(new Error("Tipo no permitido. Solo imágenes: JPG, JPEG, PNG, WEBP."));
}

const upload = multer({
  storage,
  fileFilter: imageFilter,
}).array("images", 1);

router.get("/", getAllCollaborators);
router.get("/:id", getCollaboratorById);
router.post("/", authMiddleware, upload, createCollaborator);
router.put("/:id", authMiddleware, upload, updateCollaborator);
router.delete("/:id", authMiddleware, deleteCollaborator);

export default router;
