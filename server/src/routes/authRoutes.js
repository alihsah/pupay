import express from "express";
import { protect, attachUser } from "../middleware/authMiddleware.js";
import { getCurrentUser } from "../controllers/authController.js";

const router = express.Router();

router.get("/me", protect, attachUser, getCurrentUser);

export default router;