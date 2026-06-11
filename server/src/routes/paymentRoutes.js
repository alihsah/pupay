import express from "express";

import { protect, attachUser } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { allowOwnStudentRecordOrAdmin } from "../middleware/studentOwnershipMiddleware.js";

import {
  getAllPayments,
  getPaymentsByStudentId,
  getPaymentsByCollectionId,
  createPayment,
  updatePaymentStatus,
  createPayMongoCheckout,
  handlePayMongoWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/paymongo/webhook", handlePayMongoWebhook);

router.get(
  "/",
  protect,
  attachUser,
  allowRoles("admin"),
  getAllPayments
);

router.get(
  "/collection/:collectionId",
  protect,
  attachUser,
  allowRoles("admin"),
  getPaymentsByCollectionId
);

router.get(
  "/student/:studentId",
  protect,
  attachUser,
  allowOwnStudentRecordOrAdmin,
  getPaymentsByStudentId
);

router.post(
  "/",
  protect,
  attachUser,
  allowRoles("admin"),
  createPayment
);

router.patch(
  "/:id/status",
  protect,
  attachUser,
  allowRoles("admin"),
  updatePaymentStatus
);

router.post(
  "/:paymentId/paymongo-checkout",
  protect,
  attachUser,
  allowRoles("student"),
  createPayMongoCheckout
);

export default router;