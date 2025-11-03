import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import type { User } from "../models/user.js";
import { readJSON } from "../utils/readJSON.js";
import { writeJSON } from "../utils/writeJSON.js";
import type { JwtPayloadCustom } from "../utils/jwtUtils.js"; // your typed JWT payload

const usersPath = path.join(process.cwd(), "src/data/users.json");
const uploadsDir = path.join(process.cwd(), "uploads");

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
