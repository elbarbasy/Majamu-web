/**
 * tables.service — validasi nomor meja dari QR (PRD: sistem mengenali meja).
 *
 * Logika:
 * - Jika tabel `tables` KOSONG di DB → anggap semua meja valid (belum di-setup).
 * - Jika tabel ada isi → cek apakah nomor meja ditemukan & aktif.
 * - Jika Supabase error/belum dikonfigurasi → anggap valid (dev/demo).
 */
"use client";

import { createClient } from "@/lib/supabase/client";

export interface TableLookup {
  found: boolean;
  active: boolean;
}

export async function lookupTable(tableNumber: number): Promise<TableLookup> {
  try {
    const supabase = createClient();

    // Cek apakah tabel tables punya data sama sekali.
    const { count, error: countErr } = await supabase
      .from("tables")
      .select("id", { count: "exact", head: true });

    if (countErr) throw countErr;

    // Jika tabel kosong → belum di-setup → anggap semua meja valid.
    if (!count || count === 0) {
      return { found: true, active: true };
    }

    // Cari meja spesifik.
    const { data, error } = await supabase
      .from("tables")
      .select("is_active")
      .eq("table_number", tableNumber)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { found: false, active: false };
    return { found: true, active: data.is_active ?? true };
  } catch {
    // Supabase error / belum dikonfigurasi → anggap valid.
    return { found: true, active: true };
  }
}
