/**
 * Supabase Server Clients
 *
 * - createClient(): server client berbasis cookie untuk Server Components,
 *   Route Handlers, dan Server Actions (memakai ANON KEY + sesi Supabase Auth).
 * - createServiceRoleClient(): client privilese tinggi memakai SERVICE ROLE KEY,
 *   melewati RLS. HANYA untuk kode server tepercaya (jangan diekspos ke browser).
 *
 * Env (docs/SUPABASE_SETUP.md langkah 6):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

/**
 * Server client yang sadar-sesi (cookie-based).
 * Catatan: di Next.js 15, `cookies()` bersifat async sehingga fungsi ini async.
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY harus diisi."
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Dipanggil dari Server Component — aman diabaikan jika ada
          // middleware yang me-refresh sesi pengguna.
        }
      },
    },
  });
}

/**
 * Service Role client (bypass RLS).
 * Gunakan hanya untuk operasi admin di server (mis. webhook pembayaran,
 * pembuatan akun kasir oleh owner). JANGAN gunakan di Client Components.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY harus diisi."
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
