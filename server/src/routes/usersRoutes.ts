import { Router } from "express";
import {
	getUsers,
	getCurrentUser,
	uploadProfileImage,
	getDoctorSchedule,
	getDoctors,
	getDoctorAvailability,
	bookDoctorSlot,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "./uploads" });

// Get all users (optional, admin use)
router.get("/", getUsers);

// Get all doctors for consultation booking
router.get("/doctors", getDoctors);

// Get doctor's daily slot availability
router.get("/doctors/:doctorId/availability", getDoctorAvailability);

// Get the current logged-in user
router.get("/me", authMiddleware, getCurrentUser);

// Get upcoming schedule for current doctor
router.get("/me/schedule", authMiddleware, getDoctorSchedule);

// Book a slot with a doctor
router.post("/bookings", authMiddleware, bookDoctorSlot);

// Upload/update profile image for current user
router.put("/me/image", authMiddleware, upload.single("image"), uploadProfileImage);

export default router;
