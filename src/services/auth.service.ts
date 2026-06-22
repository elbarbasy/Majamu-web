/**
 * auth.service — login/logout Owner & Kasir via Supabase Auth (PRD).
 * Setelah login, peran diambil dari tabel users (auth_user_id).
 *
 * FIX: Jika query profil via anon key gagal (RLS chicken-egg), fallback
 * ke /api/auth/profile endpoint yang memakai service_role (bypass RLS).
 */
"use client";

import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";

export interface SignInResult {
  ok: boolean;
  role?: UserRole;
  name?: string;
  error?: string;
}

export async function signIn(
  email: string,
  password: string
): Promise<SignInResult> {
  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = createClient();
  } catch {
    return {
      ok: false,
      error:
        "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL & ANON_KEY pada .env.local.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return { ok: false, error: error?.message ?? "Login gagal." };
  }

  const userId = data.user.id;

  // Coba baca profil dari tabel users (memerlukan RLS policy auth_read_users).
  const { data: profile, error: profileErr } = await supabase
    .from("users")
    .select("name, role, is_active")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (profile) {
    if (profile.is_active === false) {
      await supabase.auth.signOut();
      return { ok: false, error: "Akun dinonaktifkan. Hubungi owner." };
    }
    return {
      ok: true,
      role: profile.role as UserRole,
      name: profile.name as string,
    };
  }

  // Fallback: jika RLS masih memblokir, panggil API server (service_role).
  console.warn("[auth.service] Client query gagal, fallback ke /api/auth/profile:", profileErr?.message);
  try {
    const res = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authUserId: userId }),
    });
    if (res.ok) {
      const p = (await res.json()) as { name: string; role: string; is_active: boolean };
      if (!p.is_active) {
        await supabase.auth.signOut();
        return { ok: false, error: "Akun dinonaktifkan. Hubungi owner." };
      }
      return { ok: true, role: p.role as UserRole, name: p.name };
    }
  } catch {
    /* fallback failed */
  }

  return { ok: false, error: "Profil pengguna tidak ditemukan. Pastikan row di tabel users ada dengan auth_user_id yang benar." };
}

export async function signOut(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
}
