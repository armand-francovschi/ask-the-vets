import { buildApiUrl } from "../config/api";

const BASE_URL = buildApiUrl("/auth");

export interface AuthResponse {
  token: string;
  user: { id: number; name: string; email: string; role: string };
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

export const registerUser = async (name: string, email: string, password: string): Promise<AuthResponse> => {
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
