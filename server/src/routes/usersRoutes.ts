import { Router } from "express";
import { getUsers, getCurrentUser, uploadProfileImage } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "./uploads" });

// Get all users (optional, admin use)
router.get("/", getUsers);

// Get the current logged-in user
router.get("/me", authMiddleware, getCurrentUser);

// Upload/update profile image for current user
router.put("/me/image", authMiddleware, upload.single("image"), uploadProfileImage);

export default router;
