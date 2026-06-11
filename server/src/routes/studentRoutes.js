import express from "express";
import { uploadExcel } from "../middleware/uploadMiddleware.js";

import { protect, attachUser } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
  unlinkStudentAccount,
  importStudents,
  countTargetStudents,
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/", protect, attachUser, allowRoles("admin"), getAllStudents);

router.get("/count-target", protect, attachUser, allowRoles("admin"), countTargetStudents);

router.get("/:id", protect, attachUser, allowRoles("admin"), getStudentById);

router.post("/", protect, attachUser, allowRoles("admin"), createStudent);

router.put("/:id", protect, attachUser, allowRoles("admin"), updateStudent);


router.post(
  "/import",
  protect,
  attachUser,
  allowRoles("admin"),
  uploadExcel.single("file"),
  importStudents
);

router.patch(
  "/:id/status",
  protect,
  attachUser,
  allowRoles("admin"),
  updateStudentStatus
);

router.patch(
  "/:id/unlink",
  protect,
  attachUser,
  allowRoles("admin"),
  unlinkStudentAccount
);

export default router;