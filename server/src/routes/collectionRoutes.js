import express from "express";

import { protect, attachUser } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  getAllCollections,
  getCollectionById,
  getMyCollections,
  getCollectionProgress,
  createCollection,
  updateCollection,
  updateCollectionStatus,
} from "../controllers/collectionController.js";

const router = express.Router();

router.get(
  "/",
  protect,
  attachUser,
  allowRoles("admin"),
  getAllCollections
);

router.get(
  "/student/my",
  protect,
  attachUser,
  allowRoles("student"),
  getMyCollections
);

router.get(
  "/:id/progress",
  protect,
  attachUser,
  getCollectionProgress
);

router.get(
  "/:id",
  protect,
  attachUser,
  allowRoles("admin"),
  getCollectionById
);

router.post(
  "/",
  protect,
  attachUser,
  allowRoles("admin"),
  createCollection
);

router.put(
  "/:id",
  protect,
  attachUser,
  allowRoles("admin"),
  updateCollection
);

router.patch(
  "/:id/status",
  protect,
  attachUser,
  allowRoles("admin"),
  updateCollectionStatus
);

export default router;