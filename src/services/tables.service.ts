/**
 * tables.service — validasi nomor meja dari QR (PRD: sistem mengenali meja).
 * Memakai tabel tables. Bila Supabase belum dikonfigurasi (dev), nomor meja
 * dianggap valid agar demo tetap berjalan.
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
    const { data, error } = await supabase
      .from("tables")
      .select("is_active")
      .eq("table_number", tableNumber)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { found: false, active: false };
    return { found: true, active: data.is_active ?? true };
  } catch {
    // Supabase belum dikonfigurasi → anggap valid (dev/demo).
    return { found: true, active: true };
  }
}
