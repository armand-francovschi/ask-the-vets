import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtUtils.js";
import type { JwtPayloadCustom } from "../utils/jwtUtils.js";

// Extend Request type
export interface AuthRequest extends Request {
  user?: JwtPayloadCustom;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided or malformed" });
  }

  const token = authHeader.split(" ")[1]; // Guaranteed to exist

  try {
    const decoded = verifyToken(token!); // returns JwtPayloadCustom
    req.user = decoded; // attach typed user info
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
}
