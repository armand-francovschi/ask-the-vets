import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { signToken } from "../utils/jwtUtils.js";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { Resend } from "resend";

// Recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersPath = path.join(__dirname, "..", "data", "users.json");

interface User {
  id: number;
  name: string;
  email: string;
  password: string; // hashed
  role: "user" | "doctor";
  pets?: number[];
  image?: string;
  emailVerified?: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: string;
}

const clientUrl = process.env.CLIENT_URL?.trim() || "http://localhost:5173";
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const resendFrom = process.env.RESEND_FROM_EMAIL?.trim();
const verificationTtlMs = 1000 * 60 * 60 * 24;
const isProduction = process.env.NODE_ENV === "production";

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
      // ignore malformed referer
    }
  }

  return clientUrl;
};

const getServerBaseUrlFromRequest = (req: Request) => {
  const protocol = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim()
    || req.protocol
    || "http";
  const host = req.get("host") || `localhost:${process.env.PORT || "5000"}`;
  return `${protocol}://${host}`;
};

const buildVerificationUrl = (serverBaseUrl: string, token: string) =>
  `${serverBaseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

const generateVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + verificationTtlMs).toISOString();
  return { rawToken, tokenHash, expiresAt };
};

const sendVerificationEmail = async (email: string, name: string, verificationUrl: string) => {
  if (!resendApiKey || !resendFrom) {
    throw new Error("Email service not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.");
  }

  const resend = new Resend(resendApiKey);

  const result = await resend.emails.send({
    from: resendFrom,
    to: email,
    subject: "Verify your Ask The Vets account",
    html: `
      <p>Hello ${name},</p>
      <p>Thanks for registering with Ask The Vets. Please verify your email by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify my email</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });

  if (result.error) {
    throw new Error(`Resend send failed: ${result.error.message}`);
  }
};

const readUsers = (): User[] => {
  try {
    const data = fs.readFileSync(usersPath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeUsers = (users: User[]) => {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf-8");
};

const consumeVerificationToken = (token: string) => {
  if (!token) {
    return { ok: false as const, message: "Verification token is required" };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const users = readUsers();

  const user = users.find((u) => u.emailVerificationTokenHash === tokenHash);
  if (!user) {
    return { ok: false as const, message: "Invalid or expired verification token" };
  }

  const expiresAt = user.emailVerificationExpiresAt ? new Date(user.emailVerificationExpiresAt).getTime() : 0;
  if (!expiresAt || expiresAt < Date.now()) {
    return { ok: false as const, message: "Invalid or expired verification token" };
  }

  user.emailVerified = true;
  delete user.emailVerificationTokenHash;
  delete user.emailVerificationExpiresAt;

  writeUsers(users);

  return { ok: true as const, message: "Email verified successfully. You can now log in." };
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

  const normalizedEmail = String(email).trim().toLowerCase();

  const users = readUsers();
  if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const { rawToken, tokenHash, expiresAt } = generateVerificationToken();

  const newUser: User = {
    id: users.length > 0 ? users.at(-1)!.id + 1 : 1,
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: role || "user",
    pets: [],
    emailVerified: false,
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: expiresAt,
  };

  users.push(newUser);
  writeUsers(users);

  const verificationUrl = buildVerificationUrl(getServerBaseUrlFromRequest(req), rawToken);

  try {
    await sendVerificationEmail(newUser.email, newUser.name, verificationUrl);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    if (!isProduction) {
      return res.status(201).json({
        message: "Email delivery failed in dev mode. Use the verification link below.",
        requiresEmailVerification: true,
        verificationUrl,
      });
    }

    return res.status(500).json({ message: "Failed to send verification email" });
  }

  res.status(201).json({
    message: "Registration successful. Please check your email to verify your account.",
    requiresEmailVerification: true,
  });
};

export const login = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const normalizedEmail = String(email).trim().toLowerCase();

    const users = readUsers();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    let isMatch = false;
    try {
      isMatch = bcrypt.compareSync(password, user.password);
    } catch (compareErr) {
      console.error("Password compare failed:", compareErr);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Legacy users without this field are treated as verified.
    if (user.emailVerified === false) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    const token = signToken({ id: user.id, role: user.role });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login failed with server error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = (req: Request, res: Response) => {
  const token = String(req.body?.token || "").trim();
  const result = consumeVerificationToken(token);
  if (!result.ok) {
    return res.status(400).json({ message: result.message });
  }

  return res.json({ message: result.message });
};

export const verifyEmailFromLink = (req: Request, res: Response) => {
  const token = String(req.query.token || "").trim();
  const result = consumeVerificationToken(token);
  const clientBase = getClientBaseUrlFromRequest(req);

  if (!result.ok) {
    const error = encodeURIComponent(result.message);
    res.redirect(`${clientBase}/verify-email?status=error&message=${error}`);
    return;
  }

  const success = encodeURIComponent(result.message);
  res.redirect(`${clientBase}/verify-email?status=success&message=${success}`);
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email);

  if (!user) {
    return res.json({ message: "If this account exists, a verification email has been sent." });
  }

  if (user.emailVerified !== false) {
    return res.json({ message: "This account is already verified." });
  }

  const { rawToken, tokenHash, expiresAt } = generateVerificationToken();
  user.emailVerificationTokenHash = tokenHash;
  user.emailVerificationExpiresAt = expiresAt;
  writeUsers(users);

  const verificationUrl = buildVerificationUrl(getServerBaseUrlFromRequest(req), rawToken);

  try {
    await sendVerificationEmail(user.email, user.name, verificationUrl);
  } catch (err) {
    console.error("Failed to resend verification email:", err);
    if (!isProduction) {
      return res.json({
        message: "Email delivery failed in dev mode. Use the verification link below.",
        verificationUrl,
      });
    }

    return res.status(500).json({ message: "Failed to send verification email" });
  }

  return res.json({ message: "Verification email sent. Please check your inbox." });
};
