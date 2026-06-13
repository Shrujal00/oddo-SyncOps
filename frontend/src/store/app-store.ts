"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AppState {
  accessToken: string | null;
  user: AuthUser | null;
  activeModule: string;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  setActiveModule: (module: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      activeModule: "overview",
      setAuth: (accessToken, user) => set({ accessToken, user }),
      clearAuth: () => set({ accessToken: null, user: null }),
      setActiveModule: (activeModule) => set({ activeModule }),
    }),
    { name: "syncops-auth", partialize: (s) => ({ accessToken: s.accessToken, user: s.user }) },
  ),
);
