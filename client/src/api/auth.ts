const BASE_URL = "http://localhost:5000/auth";

export interface AuthResponse {
  token: string;
  user: { id: number; name: string; email: string; role: string };
}

export const registerUser = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
};
