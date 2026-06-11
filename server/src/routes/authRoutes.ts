import express from "express";
import { register, login, verifyEmail, verifyEmailFromLink, resendVerificationEmail } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmailFromLink);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

export default router;
