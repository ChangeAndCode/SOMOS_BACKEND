// routes/transparency.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/authorizeUserOrAdmin.js";
import { uploadSingleDoc } from "../middlewares/upload.js";
import {
  listPublic,
  getOne,
  createTransparency,
  updateTransparency,
  deleteTransparency,
} from "../controllers/transparencyController.js";

const router = express.Router();

// Público
router.get("/", listPublic);
router.get("/:id", getOne);

// Solo consejo/admin
router.post(
  "/",
  authMiddleware,
  requireAdmin,
  uploadSingleDoc,
  createTransparency
);
router.put(
  "/:id",
  authMiddleware,
  requireAdmin,
  uploadSingleDoc,
  updateTransparency
);
router.delete("/:id", authMiddleware, requireAdmin, deleteTransparency);

export default router;
