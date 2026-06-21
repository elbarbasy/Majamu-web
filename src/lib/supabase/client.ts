/**
 * Supabase Browser Client
 *
 * Digunakan di Client Components ("use client").
 * Memakai NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY
 * (sesuai docs/SUPABASE_SETUP.md langkah 6).
 */
import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY harus diisi."
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
