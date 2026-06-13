import express from "express";

import { protect, attachUser } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  generateAIReminder,
  generateAICollectionSummary,
  generateAIAnnouncement,
} from "../services/aiHelperService.js";

const router = express.Router();

router.post(
  "/reminder",
  protect,
  attachUser,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const result = await generateAIReminder(req.body || {});

      return res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      console.error("Generate AI reminder error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to generate AI reminder.",
      });
    }
  }
);

router.post(
  "/collection-summary",
  protect,
  attachUser,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const result = await generateAICollectionSummary(req.body);

      return res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      console.error("Generate AI collection summary error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to generate AI collection summary.",
      });
    }
  }
);

router.post(
  "/announcement",
  protect,
  attachUser,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const result = await generateAIAnnouncement(req.body);

      return res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      console.error("Generate AI announcement error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to generate AI announcement.",
      });
    }
  }
);

export default router;
