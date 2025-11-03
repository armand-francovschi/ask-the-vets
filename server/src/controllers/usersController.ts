import type { Request, Response } from "express";
import type { User } from "../models/user.js";
import type { Pet } from "../models/pets.js";
import path from "path";
import { readJSON } from "../utils/readJSON.js";
import { fileURLToPath } from "url";

// Recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersPath = path.join(__dirname, "..", "data", "users.json");
const petsPath = path.join(__dirname, "..", "data", "pets.json");

export const getAllUsers = (_req: Request, res: Response) => {
  const users = readJSON<User>(usersPath);
  res.json(users);
};

export const getUserById = (req: Request, res: Response) => {
  const users = readJSON<User>(usersPath);
  const userId = parseInt(req.params.id ?? "", 10);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

export const getUserPets = (req: Request, res: Response) => {
  const users = readJSON<User>(usersPath);
  const pets = readJSON<Pet>(petsPath);
  const userId = parseInt(req.params.id ?? "", 10);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const userPets = pets.filter(p => (user.pets ?? []).includes(p.id));
  res.json(userPets);
};
