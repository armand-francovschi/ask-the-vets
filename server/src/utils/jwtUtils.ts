import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "3e20bf3950d826cb61912f7fc424f337"; // use env variable in production

// Type for our payload
export interface JwtPayloadCustom {
  id: number;
  role: "user" | "doctor";
}

// Sign a token
export function signToken(payload: JwtPayloadCustom) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

// Verify a token
export function verifyToken(token: string): JwtPayloadCustom {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadCustom;
  return decoded;
}
