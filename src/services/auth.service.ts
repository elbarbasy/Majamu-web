/**
 * auth.service — login/logout Owner & Kasir via Supabase Auth (PRD).
 * Setelah login, peran diambil dari tabel users (auth_user_id).
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
  let supabase;
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

  // Ambil profil & peran dari tabel users.
  const { data: profile } = await supabase
    .from("users")
    .select("name, role, is_active")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (!profile) {
    return { ok: false, error: "Profil pengguna tidak ditemukan." };
  }
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

export async function signOut(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
}
