// routes/transparency.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/authorizeUserOrAdmin.js";
import { uploadMixed } from "../middlewares/upload.js";
import {
  listPublic,
  listAll,
  getOne,
  createTransparency,
  updateTransparency,
  deleteTransparency,
  uploadTransparencyFile
} from "../controllers/transparency.js";

const router = express.Router();

// Público
router.get("/", listPublic);
router.get("/:id", getOne);
router.post("/:id/file", uploadMixed, uploadTransparencyFile);

// Solo admin  
router.get("/admin/all", authMiddleware, requireAdmin, listAll);
router.post(
  "/",
  authMiddleware,
  requireAdmin,
  uploadMixed,
  createTransparency
);
router.put(
  "/:id",
  authMiddleware,
  requireAdmin,
  uploadMixed,
  updateTransparency
);
router.delete("/:id", authMiddleware, requireAdmin, deleteTransparency);

export default router;
