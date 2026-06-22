/**
 * cashier.service — data untuk Order Board kasir (CASHIER_UI.md).
 *
 * Sumber utama Supabase (browser client) + Realtime. Bila Supabase belum
 * dikonfigurasi / kosong, memakai SAMPLE_CASHIER_ORDERS sebagai fallback dev
 * agar board tetap dapat dirender & diuji secara interaktif.
 */
"use client";

import { createClient } from "@/lib/supabase/client";
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
  display_number: string | null;
  order_type: string | null;
  customer_name: string | null;
  whatsapp: string | null;
  notes: string | null;
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
    displayNumber: row.display_number,
    orderType: (row.order_type as CashierOrder["orderType"]) ?? null,
    customerName: row.customer_name,
    whatsapp: row.whatsapp,
    notes: row.notes,
    status: row.status as OrderStatus,
    totalPrice: Number(row.total_price) || 0,
    createdAt: row.created_at ?? new Date().toISOString(),
    items,
  };
}

const ORDER_SELECT = `id, status_url, display_number, order_type, customer_name,
  whatsapp, notes, status, total_price, created_at,
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
    return (data as unknown as OrderRow[]).map(mapOrder);
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
 */
export function subscribeOrders(onChange: () => void): () => void {
  try {
    const supabase = createClient();
    const channel = supabase
      .channel("cashier-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => onChange()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => {};
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

export async function fetchShiftNotes(): Promise<ShiftNote[]> {
  try {
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
