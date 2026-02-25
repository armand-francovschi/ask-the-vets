import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import type { User } from "../models/user.js";
import { readJSON } from "../utils/readJSON.js";
import { writeJSON } from "../utils/writeJSON.js";
import type { JwtPayloadCustom } from "../utils/jwtUtils.js"; // your typed JWT payload

const usersPath = path.join(process.cwd(), "src/data/users.json");
const schedulesPath = path.join(process.cwd(), "src/data/schedules.json");
const uploadsDir = path.join(process.cwd(), "uploads");

interface DoctorScheduleItem {
  id: number;
  doctorId: number;
  ownerId?: number;
  petId?: number;
  petName: string;
  ownerName: string;
  type: "video";
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  date?: string;
  slotStartHour?: number;
}

const DAILY_SLOT_START_HOUR = 8;
const DAILY_SLOT_COUNT = 8;

const buildTimeRanges = () =>
  Array.from({ length: DAILY_SLOT_COUNT }, (_, index) => {
    const start = DAILY_SLOT_START_HOUR + index;
    const end = start + 1;
    return {
      slotStartHour: start,
      label: `${String(start).padStart(2, "0")}:00 - ${String(end).padStart(2, "0")}:00`,
    };
  });

const toIsoAtHour = (date: string, hour: number) => {
  const normalizedHour = String(hour).padStart(2, "0");
  return `${date}T${normalizedHour}:00:00.000Z`;
};

const normalizeDateAndHour = (item: DoctorScheduleItem) => {
  if (item.date && item.slotStartHour !== undefined) {
    return { date: item.date, slotStartHour: item.slotStartHour };
  }

  const parsed = new Date(item.scheduledAt);
  return {
    date: parsed.toISOString().slice(0, 10),
    slotStartHour: parsed.getUTCHours(),
  };
};

// Extend Express Request to include user from auth middleware
interface AuthRequest extends Request {
  user?: JwtPayloadCustom;
}

// Get all users
export const getUsers = (req: Request, res: Response) => {
  const users = readJSON<User>(usersPath);
  res.json(users);
};

// Get user by ID
export const getUserById = (req: Request, res: Response) => {
  const users = readJSON<User>(usersPath);
  const userId = parseInt(req.params.id!);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

// Get current logged-in user (from token)
export const getCurrentUser = (req: AuthRequest, res: Response) => {
  const users = readJSON<User>(usersPath);
  const userId = req.user?.id; // now TypeScript knows about req.user
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

export const getDoctors = (req: Request, res: Response) => {
  const users = readJSON<User>(usersPath);
  const doctors = users
    .filter(u => u.role === "doctor")
    .map(doctor => ({ id: doctor.id, name: doctor.name }));

  res.json(doctors);
};

export const getDoctorAvailability = (req: Request, res: Response) => {
  const doctorId = parseInt(req.params.doctorId || "", 10);
  const startDate = String(req.query.startDate || "");
  const days = Number(req.query.days || 7);

  if (!doctorId || !startDate) {
    return res.status(400).json({ error: "doctorId and startDate are required" });
  }

  const safeDays = Number.isNaN(days) ? 7 : Math.min(Math.max(days, 1), 31);
  const users = readJSON<User>(usersPath);
  const doctor = users.find(u => u.id === doctorId && u.role === "doctor");
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });

  const allSchedules = readJSON<DoctorScheduleItem>(schedulesPath);
  const doctorSchedules = allSchedules.filter(item => item.doctorId === doctorId && item.status === "scheduled");
  const slotTemplate = buildTimeRanges();

  const availability = Array.from({ length: safeDays }, (_, index) => {
    const current = new Date(`${startDate}T00:00:00.000Z`);
    current.setUTCDate(current.getUTCDate() + index);
    const date = current.toISOString().slice(0, 10);

    const bookedHours = new Set(
      doctorSchedules
        .filter(item => normalizeDateAndHour(item).date === date)
        .map(item => normalizeDateAndHour(item).slotStartHour)
    );

    return {
      date,
      slots: slotTemplate.map(slot => ({
        ...slot,
        isBooked: bookedHours.has(slot.slotStartHour),
      })),
      hasFreeSlot: slotTemplate.some(slot => !bookedHours.has(slot.slotStartHour)),
    };
  });

  res.json({ doctorId, availability });
};

export const bookDoctorSlot = (req: AuthRequest, res: Response) => {
  const ownerId = req.user?.id;
  if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

  const { doctorId, petId, date, slotStartHour } = req.body as {
    doctorId?: number;
    petId?: number;
    date?: string;
    slotStartHour?: number;
  };

  if (!doctorId || !petId || !date || slotStartHour === undefined) {
    return res.status(400).json({ error: "doctorId, petId, date and slotStartHour are required" });
  }

  if (slotStartHour < DAILY_SLOT_START_HOUR || slotStartHour >= DAILY_SLOT_START_HOUR + DAILY_SLOT_COUNT) {
    return res.status(400).json({ error: "Invalid slotStartHour" });
  }

  const users = readJSON<User>(usersPath);
  const pets = readJSON<{ id: number; name: string }>(path.join(process.cwd(), "src/data/pets.json"));

  const doctor = users.find(u => u.id === doctorId && u.role === "doctor");
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });

  const owner = users.find(u => u.id === ownerId);
  if (!owner) return res.status(404).json({ error: "Owner not found" });

  const pet = pets.find(p => p.id === petId);
  if (!pet) return res.status(404).json({ error: "Pet not found" });

  const schedules = readJSON<DoctorScheduleItem>(schedulesPath);

  const alreadyBooked = schedules.some(item => {
    if (item.doctorId !== doctorId || item.status !== "scheduled") return false;
    const normalized = normalizeDateAndHour(item);
    return normalized.date === date && normalized.slotStartHour === slotStartHour;
  });

  if (alreadyBooked) {
    return res.status(409).json({ error: "Selected slot is already booked" });
  }

  const scheduledAt = toIsoAtHour(date, slotStartHour);
  const newItem: DoctorScheduleItem = {
    id: schedules.length > 0 ? Math.max(...schedules.map(item => item.id)) + 1 : 1,
    doctorId,
    ownerId,
    petId,
    petName: pet.name,
    ownerName: owner.name,
    type: "video",
    scheduledAt,
    status: "scheduled",
    date,
    slotStartHour,
  };

  schedules.push(newItem);
  writeJSON(schedulesPath, schedules);

  res.status(201).json(newItem);
};

export const getDoctorSchedule = (req: AuthRequest, res: Response) => {
  const users = readJSON<User>(usersPath);
  const currentUserId = req.user?.id;

  if (!currentUserId) return res.status(401).json({ error: "Unauthorized" });

  const currentUser = users.find(u => u.id === currentUserId);
  if (!currentUser) return res.status(404).json({ error: "User not found" });

  const scheduleItems = readJSON<DoctorScheduleItem>(schedulesPath);
  const now = new Date();

  const upcoming = scheduleItems
    .filter(item =>
      currentUser.role === "doctor"
        ? item.doctorId === currentUserId
        : item.ownerId === currentUserId
    )
    .filter(item => item.status === "scheduled")
    .filter(item => new Date(item.scheduledAt) >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map(item => ({
      ...item,
      doctorName: users.find(u => u.id === item.doctorId)?.name || "Unknown doctor",
      ownerName: users.find(u => u.id === item.ownerId)?.name || item.ownerName,
    }));

  res.json(upcoming);
};

// Upload or update profile image for current logged-in user
export const uploadProfileImage = (req: AuthRequest, res: Response) => {
  const users = readJSON<User>(usersPath);

  // Determine userId: from params (admin) or from req.user (current user)
  const userId = req.params.id ? parseInt(req.params.id) : req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!req.file?.filename) return res.status(400).json({ error: "No file uploaded" });

  // Delete old image
  if (user.image) {
    const oldPath = path.join(uploadsDir, user.image);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  // Save new image
  user.image = req.file.filename;
  writeJSON(usersPath, users);

  res.json({ filename: req.file.filename });
};
