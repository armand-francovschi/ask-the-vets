import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Stripe from "stripe";
import type { User } from "../models/user.js";
import { readJSON } from "../utils/readJSON.js";
import { writeJSON } from "../utils/writeJSON.js";
import type { JwtPayloadCustom } from "../utils/jwtUtils.js"; // your typed JWT payload

const usersPath = path.join(process.cwd(), "src/data/users.json");
const schedulesPath = path.join(process.cwd(), "src/data/schedules.json");
const paymentsPath = path.join(process.cwd(), "src/data/payments.json");
const petsPath = path.join(process.cwd(), "src/data/pets.json");
const uploadsDir = path.join(process.cwd(), "uploads");
const clientUrl = process.env.CLIENT_URL?.trim() || "http://localhost:5173";
const bookingAmountCents = Number(process.env.STRIPE_BOOKING_AMOUNT_CENTS || "5000");

const getClientBaseUrlFromRequest = (req: Request) => {
  const originHeader = req.headers.origin;
  if (typeof originHeader === "string" && originHeader.trim()) {
    return originHeader.trim();
  }

  const refererHeader = req.headers.referer;
  if (typeof refererHeader === "string" && refererHeader.trim()) {
    try {
      const refererUrl = new URL(refererHeader);
      return refererUrl.origin;
    } catch {
      // Ignore malformed referer and use fallback.
    }
  }

  return clientUrl;
};

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("Stripe secret key is not configured");
  }

  return new Stripe(secretKey);
};

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
  paidStatus: 0 | 1;
  notes?: string;
  date?: string;
  slotStartHour?: number;
  petMedicalFiles?: string[];
}

interface PaymentHistoryItem {
  id: number;
  sessionId: string;
  bookingId: number;
  ownerId?: number;
  paymentStatus: "paid" | "unpaid" | "no_payment_required";
  amountTotal: number;
  currency: string;
  paymentIntentId?: string;
  customerEmail?: string;
  createdAt: string;
  updatedAt: string;
}

const loadSchedulesWithDefaults = () => {
  const schedules = readJSON<DoctorScheduleItem & { paidStatus?: 0 | 1 }>(schedulesPath);
  if (!Array.isArray(schedules)) {
    console.warn("Schedules data is not an array. Resetting to an empty list.");
    writeJSON(schedulesPath, []);
    return [] as DoctorScheduleItem[];
  }
  let changed = false;

  const normalized = schedules.map(item => {
    if (item.paidStatus === 0 || item.paidStatus === 1) return item as DoctorScheduleItem;
    changed = true;
    return { ...item, paidStatus: 0 as const };
  });

  if (changed) {
    writeJSON(schedulesPath, normalized);
  }

  return normalized as DoctorScheduleItem[];
};

const loadPaymentsHistory = () => {
  const payments = readJSON<PaymentHistoryItem>(paymentsPath);
  return Array.isArray(payments) ? payments : [];
};

const upsertPaymentHistoryFromSession = (
  session: Stripe.Checkout.Session,
  bookingId: number
) => {
  const payments = loadPaymentsHistory();
  const now = new Date().toISOString();
  const ownerIdFromSession = Number(session.metadata?.ownerId);
  const ownerId = Number.isFinite(ownerIdFromSession) ? ownerIdFromSession : undefined;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const status: PaymentHistoryItem["paymentStatus"] =
    session.payment_status === "paid"
      ? "paid"
      : session.payment_status === "no_payment_required"
        ? "no_payment_required"
        : "unpaid";

  const existingIndex = payments.findIndex(item => item.sessionId === session.id);

  const recordFields: Omit<PaymentHistoryItem, "id" | "createdAt"> = {
    sessionId: session.id,
    bookingId,
    paymentStatus: status,
    amountTotal: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    updatedAt: now,
  };

  if (ownerId !== undefined) {
    recordFields.ownerId = ownerId;
  }
  if (paymentIntentId) {
    recordFields.paymentIntentId = paymentIntentId;
  }
  if (session.customer_details?.email) {
    recordFields.customerEmail = session.customer_details.email;
  }

  if (existingIndex >= 0) {
    const existing = payments[existingIndex]!;
    payments[existingIndex] = {
      id: existing.id,
      createdAt: existing.createdAt,
      ...recordFields,
    };
  } else {
    const nextId = payments.length > 0 ? Math.max(...payments.map(item => item.id)) + 1 : 1;
    payments.push({
      id: nextId,
      createdAt: now,
      ...recordFields,
    });
  }

  writeJSON(paymentsPath, payments);
};

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
    .map(doctor => ({ id: doctor.id, name: doctor.name, image: doctor.image }));

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

  const allSchedules = loadSchedulesWithDefaults();
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

  const schedules = loadSchedulesWithDefaults();

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
    paidStatus: 0,
    date,
    slotStartHour,
  };

  schedules.push(newItem);
  writeJSON(schedulesPath, schedules);

  res.status(201).json(newItem);
};

export const createBookingPaymentSession = async (req: AuthRequest, res: Response) => {
  const ownerId = req.user?.id;
  if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

  const bookingId = Number(req.params.bookingId);
  if (!Number.isFinite(bookingId)) {
    return res.status(400).json({ error: "Invalid booking id" });
  }

  const schedules = loadSchedulesWithDefaults();
  const booking = schedules.find(item => item.id === bookingId);
  const users = readJSON<User>(usersPath);

  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (booking.ownerId !== ownerId) {
    return res.status(403).json({ error: "You can only pay for your own bookings" });
  }
  if (booking.paidStatus === 1) {
    return res.status(409).json({ error: "This booking is already paid" });
  }

  const amount = Number.isFinite(bookingAmountCents) && bookingAmountCents > 0 ? bookingAmountCents : 5000;
  const redirectBaseUrl = getClientBaseUrlFromRequest(req);

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${redirectBaseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${redirectBaseUrl}/payment-failed?payment=cancelled&booking_id=${booking.id}`,
      metadata: {
        bookingId: String(booking.id),
        ownerId: String(ownerId),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: `Pet consultation for ${booking.petName}`,
              description: `Booking with ${users.find(user => user.id === booking.doctorId)?.name || "your doctor"} on ${new Date(booking.scheduledAt).toLocaleString()}`,
            },
          },
        },
      ],
    });

    if (!session.url) {
      return res.status(500).json({ error: "Stripe session URL was not generated" });
    }

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    res.status(500).json({ error: "Could not start payment checkout" });
  }
};

export const confirmBookingPayment = async (req: Request, res: Response) => {
  const { sessionId } = req.body as { sessionId?: string };

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const bookingId = Number(session.metadata?.bookingId);
    if (!Number.isFinite(bookingId)) {
      return res.status(400).json({ error: "Invalid booking metadata" });
    }

    const schedules = loadSchedulesWithDefaults();
    const booking = schedules.find(item => item.id === bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const isPaid = session.payment_status === "paid";

    upsertPaymentHistoryFromSession(session, bookingId);

    if (isPaid && booking.paidStatus !== 1) {
      booking.paidStatus = 1;
      writeJSON(schedulesPath, schedules);
    }

    return res.json({ success: true, bookingId, paidStatus: isPaid ? 1 : 0 });
  } catch (error) {
    console.error("Stripe payment confirmation failed:", error);
    return res.status(500).json({ error: "Could not confirm payment" });
  }
};

export const getDoctorSchedule = (req: AuthRequest, res: Response) => {
  const users = readJSON<User>(usersPath);
  const currentUserId = req.user?.id;

  if (!currentUserId) return res.status(401).json({ error: "Unauthorized" });

  const currentUser = users.find(u => u.id === currentUserId);
  if (!currentUser) return res.status(404).json({ error: "User not found" });

  const scheduleItems = loadSchedulesWithDefaults();
  const pets = readJSON<{ id: number; medicalFiles?: string[] }>(petsPath);

  const upcoming = scheduleItems
    .filter(item => item.doctorId === currentUserId || item.ownerId === currentUserId)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map(item => ({
      ...item,
      paidStatus: item.paidStatus === 1 ? 1 : 0,
      petMedicalFiles: pets.find(p => p.id === item.petId)?.medicalFiles || [],
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
