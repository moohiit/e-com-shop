import express from "express";
import {
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
} from "../controllers/sellerApplicationController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// User routes
router.route("/").post(submitApplication);
router.route("/my").get(getMyApplication);

// Admin routes
router.route("/admin").get(isAdmin, getAllApplications);
router.route("/admin/:id").put(isAdmin, reviewApplication);

export default router;
