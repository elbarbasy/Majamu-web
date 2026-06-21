/**
 * authStore — sesi Owner/Kasir (STATE_MANAGEMENT.md).
 * Menyimpan profil ringkas pengguna terautentikasi. Kredensial dikelola
 * Supabase Auth; store ini hanya untuk kebutuhan UI (peran, nama).
 */
"use client";

import { create } from "zustand";

import type { UserRole } from "@/types/database";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  clear: () => set({ user: null, isAuthenticated: false }),
}));
