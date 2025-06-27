import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  contactFormSubmission,
  sendOtp,
  verifyOtp,
  resetPassword
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/contact', contactFormSubmission);
export default router;
