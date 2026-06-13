import express from "express";

import { protect, attachUser } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  getStudentUnreadCount,
  markNotificationRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get(
  "/student/unread-count",
  protect,
  attachUser,
  allowRoles("student"),
  getStudentUnreadCount
);

router.patch(
  "/:id/read",
  protect,
  attachUser,
  allowRoles("student"),
  markNotificationRead
);

export default router;
