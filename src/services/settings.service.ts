/**
 * settings.service — pembacaan pengaturan toko untuk sisi publik (pelanggan).
 * Memakai store_settings (read publik via RLS). Fallback "open" bila Supabase
 * belum dikonfigurasi.
 */
"use client";

import { createClient } from "@/lib/supabase/client";

export async function getStoreStatus(): Promise<"open" | "closed"> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("store_status")
      .limit(1)
      .maybeSingle();
    return (data?.store_status as "open" | "closed") ?? "open";
  } catch {
    return "open";
  }
}
