import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { signToken } from "../utils/jwtUtils.js";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

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
}

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

export const register = (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

  const users = readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser: User = {
    id: users.length > 0 ? users.at(-1)!.id + 1 : 1,
    name,
    email,
    password: hashedPassword,
    role: role || "user",
    pets: [],
  };

  users.push(newUser);
  writeUsers(users);

  const token = signToken({ id: newUser.id, role: newUser.role });
  res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
};

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });

  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ id: user.id, role: user.role });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};
