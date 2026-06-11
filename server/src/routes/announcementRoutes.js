import express from "express";

import { protect, attachUser } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  getAllAnnouncements,
  getMyAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  updateAnnouncementStatus,
} from "../controllers/announcementController.js";

const router = express.Router();

router.get(
  "/",
  protect,
  attachUser,
  allowRoles("admin"),
  getAllAnnouncements
);

router.get(
  "/student/my",
  protect,
  attachUser,
  allowRoles("student"),
  getMyAnnouncements
);

router.get(
  "/:id",
  protect,
  attachUser,
  allowRoles("admin"),
  getAnnouncementById
);

router.post(
  "/",
  protect,
  attachUser,
  allowRoles("admin"),
  createAnnouncement
);

router.put(
  "/:id",
  protect,
  attachUser,
  allowRoles("admin"),
  updateAnnouncement
);

router.patch(
  "/:id/status",
  protect,
  attachUser,
  allowRoles("admin"),
  updateAnnouncementStatus
);

export default router;