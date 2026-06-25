/**
 * orders.service — pembuatan & pengambilan order untuk Customer.
 *
 * createOrder mencoba menulis ke Supabase; bila gagal (mis. env belum diset),
 * mengembalikan order hasil generate lokal agar alur checkout tetap berjalan
 * di mode pengembangan. Tidak mengubah desain/alur wireframe.
 */
"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  CartItem,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from "@/types";

export interface CreateOrderInput {
  items: CartItem[];
  customerName: string;
  whatsapp: string;
  notes: string;
  paymentMethod: PaymentMethod;
  orderType: OrderType;
  tableNumber: number | null;
}

export interface OrderResult {
  orderId: string;
  statusUrl: string;
  receiptNumber: string;
  paymentCode: string | null;
  displayNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  items: CartItem[];
  customerName: string;
  whatsapp: string;
  notes: string;
  paymentMethod: PaymentMethod;
}

function pad(n: number, len: number): string {
  return String(n).padStart(len, "0");
}

function todayStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(d.getDate(), 2)}`;
}

function randomToken(len = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function totalOf(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/** Buat order. Mengembalikan OrderResult (Supabase atau fallback lokal). */
export async function createOrder(input: CreateOrderInput): Promise<OrderResult> {
  const total = totalOf(input.items);
  const statusUrl = randomToken(12);
  const seq = Math.floor(Math.random() * 9999) + 1;
  const receiptNumber = `MJM-${todayStamp()}-${pad(seq, 4)}`;
  const displayNumber =
    input.orderType === "dine_in" && input.tableNumber != null
      ? `Meja ${input.tableNumber}`
      : `A-${pad(seq, 3)}`;
  const createdAt = new Date().toISOString();

  const base: OrderResult = {
    orderId: "",
    statusUrl,
    receiptNumber,
    paymentCode: input.paymentMethod === "cash" ? paymentCode : null,
    displayNumber,
    orderType: input.orderType,
    status: "menunggu_bayar",
    totalPrice: total,
    createdAt,
    items: input.items,
    customerName: input.customerName,
    whatsapp: input.whatsapp,
    notes: input.notes,
    paymentMethod: input.paymentMethod,
  };

  try {
    const supabase = createClient();

    // Nomor urut harian ATOMIK via RPC (mencegah tabrakan nomor).
    let seqNum = seq;
    const { data: seqData, error: seqError } =
      await supabase.rpc("next_daily_sequence");
    if (!seqError && typeof seqData === "number") seqNum = seqData;

    const finalReceipt = `MJM-${todayStamp()}-${pad(seqNum, 4)}`;
    const paymentCode = `MJM-${todayStamp()}-${pad(seqNum, 6)}`;
    const finalDisplay =
      input.orderType === "dine_in" && input.tableNumber != null
        ? `Meja ${input.tableNumber}`
        : `A-${pad(seqNum, 3)}`;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        status_url: statusUrl,
        receipt_number: finalReceipt,
        payment_code: input.paymentMethod === "cash" ? paymentCode : null,
        order_type: input.orderType,
        display_number: finalDisplay,
        customer_name: input.customerName || null,
        whatsapp: input.whatsapp,
        notes: input.notes || null,
        payment_method: input.paymentMethod,
        status: "menunggu_bayar",
        total_price: total,
      })
      .select("id")
      .single();

    if (error || !order) throw error ?? new Error("insert order gagal");

    const orderId = order.id as string;

    await supabase.from("order_items").insert(
      input.items.map((i) => ({
        order_id: orderId,
        product_id: i.productId.startsWith("sample-") ? null : i.productId,
        product_name_snapshot: i.name,
        price_snapshot: i.price,
        sweetness_level: i.sweetnessLevel,
        temperature: i.temperature,
        quantity: i.quantity,
        subtotal: i.price * i.quantity,
      }))
    );

    await supabase.from("payments").insert({
      order_id: orderId,
      method: input.paymentMethod,
      status: "pending",
      amount: total,
    });

    await supabase
      .from("order_status_history")
      .insert({ order_id: orderId, status: "menunggu_bayar" });

    return {
      ...base,
      orderId,
      receiptNumber: finalReceipt,
      paymentCode: input.paymentMethod === "cash" ? paymentCode : null,
      displayNumber: finalDisplay,
    };
  } catch (err) {
    console.warn("[orders.service] fallback order lokal:", err);
    return { ...base, orderId: `local-${randomToken(8)}` };
  }
}

/** Ambil status order via status_url (untuk tracking). null bila tidak tersedia. */
export async function getOrderStatusByUrl(
  statusUrl: string
): Promise<{ status: OrderStatus } | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("status")
      .eq("status_url", statusUrl)
      .maybeSingle();
    if (error || !data) return null;
    return { status: data.status as OrderStatus };
  } catch {
    return null;
  }
}
