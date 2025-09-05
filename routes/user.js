import express from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from "../controllers/user.js";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdmin, authorizeUserOrAdmin } from "../middlewares/authorizeUserOrAdmin.js";

const router = express.Router();

router.use(authMiddleware); // todas protegidas

router.get("/", requireAdmin, getAllUsers);
router.get("/:id", authorizeUserOrAdmin, getUserById);
router.post("/", requireAdmin, createUser);
router.put("/:id", authorizeUserOrAdmin, updateUser);
router.delete("/:id", requireAdmin, deleteUser);

export default router;
