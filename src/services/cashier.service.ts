/**
 * cashier.service — data untuk Order Board kasir (CASHIER_UI.md).
 *
 * Sumber utama Supabase (browser client) + Realtime. Bila Supabase belum
 * dikonfigurasi / kosong, memakai SAMPLE_CASHIER_ORDERS sebagai fallback dev
 * agar board tetap dapat dirender & diuji secara interaktif.
 */
"use client";

import { createClient } from "@/lib/supabase/client";
import { ownerDb } from "@/lib/owner-store";
import { SAMPLE_CASHIER_ORDERS } from "@/lib/sample-data";
import type {
  CashierOrder,
  CashierOrderItem,
  OrderStatus,
  ShiftNote,
} from "@/types";

type OrderRow = {
  id: string;
  status_url: string | null;
  receipt_number: string | null;
  display_number: string | null;
  order_type: string | null;
  customer_name: string | null;
  whatsapp: string | null;
  notes: string | null;
  payment_method: string | null;
  status: string;
  total_price: number | null;
  created_at: string | null;
  order_items:
    | {
        product_name_snapshot: string | null;
        quantity: number;
        sweetness_level: string | null;
        temperature: string | null;
        price_snapshot: number | null;
      }[]
    | null;
};

function mapOrder(row: OrderRow): CashierOrder {
  const items: CashierOrderItem[] = (row.order_items ?? []).map((i) => ({
    name: i.product_name_snapshot ?? "Produk",
    quantity: i.quantity,
    sweetnessLevel: (i.sweetness_level as CashierOrderItem["sweetnessLevel"]) ?? null,
    temperature: (i.temperature as CashierOrderItem["temperature"]) ?? null,
    price: Number(i.price_snapshot) || 0,
  }));
  return {
    id: row.id,
    statusUrl: row.status_url,
    receiptNumber: row.receipt_number ?? null,
    displayNumber: row.display_number,
    orderType: (row.order_type as CashierOrder["orderType"]) ?? null,
    customerName: row.customer_name,
    whatsapp: row.whatsapp,
    notes: row.notes,
    paymentMethod: row.payment_method ?? null,
    status: row.status as OrderStatus,
    totalPrice: Number(row.total_price) || 0,
    createdAt: row.created_at ?? new Date().toISOString(),
    items,
  };
}

const ORDER_SELECT = `id, status_url, receipt_number, display_number, order_type, customer_name,
  whatsapp, notes, payment_method, status, total_price, created_at,
  order_items ( product_name_snapshot, quantity, sweetness_level, temperature, price_snapshot )`;

/** Order aktif (belum selesai) untuk board. */
export async function fetchActiveOrders(): Promise<CashierOrder[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .neq("status", "selesai")
      .order("created_at", { ascending: true });
    if (error) throw error;
    if (!data) return SAMPLE_CASHIER_ORDERS;
    // Filter: QRIS menunggu_bayar tidak ditampilkan (otomatis muncul setelah callback set ke diracik)
    return (data as unknown as OrderRow[]).map(mapOrder).filter(
      (o) => !(o.status === "menunggu_bayar" && o.paymentMethod === "qris")
    );
  } catch (err) {
    console.warn("[cashier.service] fallback sample orders:", err);
    return SAMPLE_CASHIER_ORDERS;
  }
}

/** Order selesai (riwayat). */
export async function fetchCompletedOrders(): Promise<CashierOrder[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("status", "selesai")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    if (!data) return [];
    return (data as unknown as OrderRow[]).map(mapOrder);
  } catch (err) {
    console.warn("[cashier.service] fallback completed kosong:", err);
    return [];
  }
}

/** Ubah status order + catat ke order_status_history. */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) throw error;
    await supabase
      .from("order_status_history")
      .insert({ order_id: orderId, status });
    return true;
  } catch (err) {
    console.warn("[cashier.service] updateOrderStatus gagal (mode lokal):", err);
    return false;
  }
}

/**
 * Subscribe realtime perubahan tabel orders (SUPABASE_SETUP.md Realtime).
 * Memanggil onChange setiap ada INSERT/UPDATE/DELETE. Mengembalikan unsubscribe.
 *
 * PENTING: Realtime harus diaktifkan di Supabase Dashboard:
 * Database → Replication → aktifkan tabel "orders".
 */
export function subscribeOrders(onChange: () => void): () => void {
  try {
    const supabase = createClient();
    const channel = supabase
      .channel("cashier-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => onChange()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_status_history" },
        () => onChange()
      )
      .subscribe((status) => {
        console.info("[realtime] subscription status:", status);
      });
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("[realtime] subscribe gagal, fallback polling:", err);
    // Fallback: polling setiap 5 detik jika realtime gagal.
    const interval = setInterval(onChange, 5000);
    return () => clearInterval(interval);
  }
}

/** Buat catatan shift. */
export async function createShiftNote(input: {
  category: string;
  nominal: number | null;
  description: string;
}): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("shift_notes").insert({
      category: input.category,
      nominal: input.nominal,
      description: input.description || null,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("[cashier.service] createShiftNote gagal:", err);
    return false;
  }
}

/** ============ SESI KAS (v1.1 blind count) ============ */

export interface CashSession {
  id: string;
  tanggal: string;
  modalAwal: number;
  kasFisikTerhitung: number | null;
  selisih: number | null;
  waktuBuka: string;
  waktuTutup: string | null;
  status: "berjalan" | "selesai";
}

/** Sesi kas aktif (status = berjalan). null bila belum dibuka hari ini. */
export async function getActiveSession(): Promise<CashSession | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("cash_sessions")
      .select("*")
      .eq("status", "berjalan")
      .order("waktu_buka", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    return mapSession(data);
  } catch {
    return null;
  }
}

function mapSession(d: Record<string, unknown>): CashSession {
  return {
    id: String(d.id ?? ""),
    tanggal: String(d.tanggal ?? ""),
    modalAwal: Number(d.modal_awal) || 0,
    kasFisikTerhitung: d.kas_fisik_terhitung != null ? Number(d.kas_fisik_terhitung) : null,
    selisih: d.selisih != null ? Number(d.selisih) : null,
    waktuBuka: String(d.waktu_buka ?? ""),
    waktuTutup: d.waktu_tutup ? String(d.waktu_tutup) : null,
    status: (d.status as CashSession["status"]) ?? "berjalan",
  };
}

/** Buka toko (buat sesi kas baru). */
export async function openCashSession(modalAwal: number): Promise<CashSession | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cash_sessions")
      .insert({
        modal_awal: modalAwal,
        status: "berjalan",
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapSession(data as Record<string, unknown>);
  } catch {
    // fallback dev
    return {
      id: `local-sess-${Date.now()}`,
      tanggal: new Date().toISOString().slice(0, 10),
      modalAwal,
      kasFisikTerhitung: null,
      selisih: null,
      waktuBuka: new Date().toISOString(),
      waktuTutup: null,
      status: "berjalan",
    };
  }
}

/** Tutup toko: kasir memasukkan jumlah kas fisik (blind count). */
export async function closeCashSession(
  sessionId: string,
  kasFisik: number
): Promise<boolean> {
  try {
    const supabase = createClient();
    await supabase
      .from("cash_sessions")
      .update({
        kas_fisik_terhitung: kasFisik,
        waktu_tutup: new Date().toISOString(),
        status: "selesai",
      })
      .eq("id", sessionId);
    return true;
  } catch {
    return true; // dev
  }
}

/** Ambil threshold selisih kas dari settings. */
export async function getThresholdSelisih(): Promise<number> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("threshold_selisih_kas")
      .limit(1)
      .maybeSingle();
    return Number(data?.threshold_selisih_kas) || 10000;
  } catch {
    return ownerDb().settings.thresholdSelisihKas;
  }
}

/** Hitung kas seharusnya untuk sesi berjalan (kasir TIDAK BOLEH lihat ini).
 * Dipakai hanya oleh internal (threshold nudge) & Owner rekonsiliasi. */
export async function computeExpectedCash(session: CashSession): Promise<number> {
  let penjualanTunai = 0;
  let tambahModal = 0;
  let pengeluaran = 0;
  try {
    const supabase = createClient();
    // Penjualan tunai hari ini
    const { data: orders } = await supabase
      .from("orders")
      .select("total_price")
      .eq("payment_method", "cash")
      .neq("status", "menunggu_bayar")
      .gte("created_at", session.waktuBuka);
    penjualanTunai = (orders ?? []).reduce((s, o) => s + (Number(o.total_price) || 0), 0);
    // Entries pada sesi ini
    const { data: entries } = await supabase
      .from("cash_entries")
      .select("type, amount")
      .eq("session_id", session.id);
    (entries ?? []).forEach((e) => {
      if (e.type === "tambah_modal") tambahModal += Number(e.amount) || 0;
      if (e.type === "expense" || e.type === "pengeluaran")
        pengeluaran += Number(e.amount) || 0;
    });
  } catch {
    /* dev fallback: leave 0 */
  }
  return session.modalAwal + penjualanTunai + tambahModal - pengeluaran;
}

export async function fetchShiftNotes(): Promise<ShiftNote[]> {  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("shift_notes")
      .select("id, category, nominal, description, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    if (!data) return [];
    return data.map((n) => ({
      id: n.id,
      category: n.category ?? "lainnya",
      nominal: n.nominal != null ? Number(n.nominal) : null,
      description: n.description,
      createdAt: n.created_at ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/* ---- Toggle Stok Habis Hari Ini ---- */

export interface StockProduct {
  id: string;
  name: string;
  stockStatus: "available" | "out_of_stock";
}

export async function fetchStockProducts(): Promise<StockProduct[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock_status")
      .eq("menu_status", "active")
      .order("name", { ascending: true });
    if (error) throw error;
    if (!data) return [];
    return data.map((p) => ({
      id: p.id,
      name: p.name,
      stockStatus: p.stock_status === "out_of_stock" ? "out_of_stock" : "available",
    }));
  } catch {
    return [];
  }
}

export async function setStockStatus(
  productId: string,
  status: "available" | "out_of_stock"
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({ stock_status: status })
      .eq("id", productId);
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}
