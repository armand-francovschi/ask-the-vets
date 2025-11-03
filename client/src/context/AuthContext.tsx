// client/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { loginUser, registerUser } from "../api/auth";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data: User = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    localStorage.setItem("token", res.token);

    // fetch current user info from backend
    const userRes = await fetch("http://localhost:5000/users/me", {
      headers: { Authorization: `Bearer ${res.token}` },
    });
    if (!userRes.ok) throw new Error("Failed to fetch user after login");
    const currentUser: User = await userRes.json();
    setUser(currentUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await registerUser(name, email, password);
    localStorage.setItem("token", res.token);

    const userRes = await fetch("http://localhost:5000/users/me", {
      headers: { Authorization: `Bearer ${res.token}` },
    });
    if (!userRes.ok) throw new Error("Failed to fetch user after registration");
    const currentUser: User = await userRes.json();
    setUser(currentUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
