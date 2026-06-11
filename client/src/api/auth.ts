import { buildApiUrl } from "../config/api";

const BASE_URL = buildApiUrl("/auth");

export interface AuthResponse {
  token: string;
  user: { id: number; name: string; email: string; role: string };
}

export interface RegisterResponse {
  message: string;
  requiresEmailVerification: boolean;
  verificationUrl?: string;
}

export interface BasicMessageResponse {
  message: string;
  verificationUrl?: string;
}

const getErrorMessage = async (res: Response, fallback: string) => {
  const contentType = res.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const json = await res.json();
      return json?.message || json?.error || `${fallback} (${res.status})`;
    }

    const text = await res.text();
    return text || `${fallback} (${res.status})`;
  } catch {
    return `${fallback} (${res.status})`;
  }
};

export const registerUser = async (name: string, email: string, password: string): Promise<RegisterResponse> => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, "Registration failed"));
  return res.json();
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, "Login failed"));
  return res.json();
};

export const verifyEmailToken = async (token: string): Promise<BasicMessageResponse> => {
  const res = await fetch(`${BASE_URL}/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, "Email verification failed"));
  return res.json();
};

export const resendVerificationEmail = async (email: string): Promise<BasicMessageResponse> => {
  const res = await fetch(`${BASE_URL}/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to resend verification email"));
  return res.json();
};
