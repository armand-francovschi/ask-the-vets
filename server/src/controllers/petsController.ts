import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import type { Pet } from "../models/pets.js";
import type { User } from "../models/user.js";
import { readJSON } from "../utils/readJSON.js";
import { writeJSON } from "../utils/writeJSON.js";
import { fileURLToPath } from "url";

// Recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const petsPath = path.join(__dirname, "..", "data", "pets.json");
const usersPath = path.join(__dirname, "..", "data", "users.json");
const uploadsDir = path.join(__dirname, "..", "uploads");

// --- GET all pets ---
export const getAllPets = (_req: Request, res: Response) => {
  const pets = readJSON<Pet>(petsPath).map(p => ({ ...p, medicalFiles: p.medicalFiles || [] }));
  res.json(pets);
};

// --- Add a new pet ---
export const addPet = (req: Request, res: Response) => {
  const pets = readJSON<Pet>(petsPath);
  const users = readJSON<User>(usersPath);

  const { name, type, breed, age, userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const newPet: Pet = {
    id: pets.length > 0 ? (pets.at(-1)?.id ?? 0) + 1 : 1,
    name,
    type,
    breed,
    age,
    medicalFiles: [],
  };

  pets.push(newPet);
  writeJSON(petsPath, pets);

  const user = users.find(u => u.id === userId);
  if (user) {
    user.pets = user.pets ?? [];
    user.pets.push(newPet.id);
    writeJSON(usersPath, users);
  }

  res.status(201).json(newPet);
};

// --- Update pet ---
export const updatePet = (req: Request, res: Response) => {
  const petId = parseInt(req.params.id ?? "", 10);
  const pets = readJSON<Pet>(petsPath);
  const users = readJSON<User>(usersPath);

  const index = pets.findIndex(p => p.id === petId);
  if (index === -1) return res.status(404).json({ error: "Pet not found" });

  pets[index] = { ...pets[index], ...req.body };
  writeJSON(petsPath, pets);

  res.json(pets[index]);
};

// --- Delete pet ---
export const deletePet = (req: Request, res: Response) => {
  const petId = parseInt(req.params.id ?? "", 10);

  let pets = readJSON<Pet>(petsPath);
  if (!pets.some(p => p.id === petId)) return res.status(404).json({ error: "Pet not found" });
  pets = pets.filter(p => p.id !== petId);
  writeJSON(petsPath, pets);

  const users = readJSON<User>(usersPath);
  users.forEach(u => {
    u.pets = (u.pets || []).filter(pid => pid !== petId);
  });
  writeJSON(usersPath, users);

  res.json({ success: true });
};

// --- Upload profile image ---
export const uploadProfileImage = (req: Request, res: Response) => {
  const petId = parseInt(req.params.id ?? "", 10);
  const pets = readJSON<Pet>(petsPath);
  const pet = pets.find(p => p.id === petId);
  if (!pet) return res.status(404).json({ message: "Pet not found" });
  if (!req.file?.filename) return res.status(400).json({ message: "No file uploaded" });

  if (pet.image) {
    const oldPath = path.join(uploadsDir, pet.image);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  pet.image = req.file.filename;
  writeJSON(petsPath, pets);

  res.json({ filename: req.file.filename });
};

// --- Upload medical file ---
export const uploadMedicalFile = (req: Request, res: Response) => {
  const petId = parseInt(req.params.id ?? "", 10);
  const pets = readJSON<Pet>(petsPath);
  const pet = pets.find(p => p.id === petId);
  if (!pet) return res.status(404).json({ message: "Pet not found" });
  if (!req.file?.filename) return res.status(400).json({ message: "No file uploaded" });

  pet.medicalFiles.push(req.file.filename);
  writeJSON(petsPath, pets);

  res.json({ filename: req.file.filename });
};
