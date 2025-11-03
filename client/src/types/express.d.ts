import type { User } from "../models/user.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: number; role: "user" | "doctor" };
  }
}
