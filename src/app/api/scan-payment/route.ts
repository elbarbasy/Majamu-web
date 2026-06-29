/**
 * POST /api/scan-payment — kasir scan QR / input payment code.
 * Body: { paymentCode: string, action: "lookup" | "confirm" | "cancel" }
 *
 * lookup : cari order by payment_code / receipt_number, kembalikan info.
 * confirm: kasir terima pembayaran tunai → status "diterima" + kirim WA.
 * cancel : pembayaran kedaluwarsa → status "dibatalkan".
 *
 * Strategi klien:
 * - Operasi tulis (update status) memakai SESI LOGIN KASIR (cookie-based),
 *   karena RLS sudah mengizinkan role cashier/owner meng-update orders.
 *   Ini membuat konfirmasi pembayaran TIDAK bergantung pada service_role.
 * - Bila sesi tidak berwenang (mis. cancel dari halaman pelanggan anonim),
 *   otomatis fallback ke service_role (bila dikonfigurasi).
 */
import { NextResponse } from "next/server";

import { buildOrderWhatsApp, fonnteConfigured, sendWhatsApp } from "@/lib/fonnte";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type AnyClient = {
  from: (table: string) => {
    update: (v: Record<string, unknown>) => {
      eq: (c: string, val: string) => { select: (s: string) => Promise<{ data: unknown[] | null; error: { message: string } | null }> };
    };
    insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
};

function rupiah(v: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(v || 0);
}

/**
 * Update status order, coba via sesi kasir dulu lalu fallback service_role.
 * Mengembalikan client yang berhasil agar dipakai untuk insert history.
 */
async function updateStatus(
  sessionClient: AnyClient,
  orderId: string,
  newStatus: string
): Promise<{ ok: boolean; client?: AnyClient; error?: string }> {
  // 1) Coba dengan sesi login (kasir/owner) — RLS mengizinkan.
  const r1 = await sessionClient
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId)
    .select("id");
  if (!r1.error && r1.data && r1.data.length > 0) {
    return { ok: true, client: sessionClient };
  }

  // 2) Fallback: service_role (bypass RLS) — untuk aksi anonim (cancel).
  try {
    const svc = createServiceRoleClient() as unknown as AnyClient;
    const r2 = await svc
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .select("id");
    if (!r2.error && r2.data && r2.data.length > 0) {
      return { ok: true, client: svc };
    }
    return { ok: false, error: r2.error?.message || r1.error?.message || "no_rows" };
  } catch {
    return { ok: false, error: r1.error?.message || "no_rows" };
  }
}

export async function POST(request: Request) {
  let body: { paymentCode?: string; action?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { paymentCode, action } = body;
  if (!paymentCode) {
    return NextResponse.json({ error: "payment_code_required" }, { status: 400 });
  }

  // Klien berbasis sesi (cookie). Untuk SELECT publik & UPDATE oleh kasir.
  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "server_not_configured" }, { status: 501 });
  }

  // Lookup order by payment_code OR receipt_number (fallback jika kolom belum ada)
  let order: Record<string, unknown> | null = null;

  const { data: d1 } = await supabase
    .from("orders")
    .select("id, display_number, customer_name, whatsapp, total_price, status, status_url, receipt_number, payment_method")
    .eq("payment_code", paymentCode)
    .maybeSingle();

  if (d1) {
    order = d1 as Record<string, unknown>;
  } else {
    const { data: d2 } = await supabase
      .from("orders")
      .select("id, display_number, customer_name, whatsapp, total_price, status, status_url, receipt_number, payment_method")
      .eq("receipt_number", paymentCode)
      .maybeSingle();
    if (d2) order = d2 as Record<string, unknown>;
  }

  if (!order) {
    return NextResponse.json({ found: false, error: "not_found" }, { status: 404 });
  }

  // Action: lookup
  if (action === "lookup" || !action) {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_name_snapshot, quantity, price_snapshot, sweetness_level, temperature")
      .eq("order_id", String(order.id));

    return NextResponse.json({
      found: true,
      order: {
        id: String(order.id),
        displayNumber: order.display_number ?? null,
        customerName: order.customer_name ?? null,
        totalPrice: Number(order.total_price) || 0,
        status: order.status ?? "menunggu_bayar",
        paymentMethod: order.payment_method ?? "cash",
        items: (items ?? []).map((i) => ({
          name: i.product_name_snapshot,
          quantity: i.quantity,
          price: Number(i.price_snapshot) || 0,
          sweetness: i.sweetness_level,
          temperature: i.temperature,
        })),
      },
    });
  }

  // Action: confirm (tunai) → status "diterima" (kasir lalu klik "Mulai Racik")
  if (action === "confirm") {
    if (order.status !== "menunggu_bayar") {
      return NextResponse.json({ error: "already_confirmed", status: order.status });
    }

    const res = await updateStatus(supabase as unknown as AnyClient, String(order.id), "diterima");
    if (!res.ok) {
      return NextResponse.json(
        {
          error: "update_no_rows",
          detail:
            "Update gagal/0 baris. Pastikan kasir sudah login (sesi aktif) atau SUPABASE_SERVICE_ROLE_KEY benar. " +
            (res.error ?? ""),
        },
        { status: 403 }
      );
    }

    await res.client!
      .from("order_status_history")
      .insert({ order_id: String(order.id), status: "diterima" });

    if (fonnteConfigured() && order.whatsapp) {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const message = buildOrderWhatsApp({
        name: String(order.customer_name ?? ""),
        orderNumber: String(order.display_number ?? ""),
        receiptNumber: String(order.receipt_number ?? ""),
        total: rupiah(Number(order.total_price) || 0),
        receiptUrl: `${base}/receipt/${order.receipt_number}`,
        statusUrl: `${base}/order/${order.status_url}`,
      });
      await sendWhatsApp(String(order.whatsapp), message);
    }

    return NextResponse.json({ success: true, newStatus: "diterima" });
  }

  // Action: cancel (auto-cancel saat hitung mundur pembayaran habis)
  if (action === "cancel") {
    if (order.status !== "menunggu_bayar") {
      return NextResponse.json({ error: "not_cancellable", status: order.status });
    }

    const res = await updateStatus(supabase as unknown as AnyClient, String(order.id), "dibatalkan");
    if (!res.ok) {
      return NextResponse.json(
        { error: "update_no_rows", detail: res.error ?? "RLS/service role" },
        { status: 403 }
      );
    }

    await res.client!
      .from("order_status_history")
      .insert({ order_id: String(order.id), status: "dibatalkan" });

    return NextResponse.json({ success: true, newStatus: "dibatalkan" });
  }

  return NextResponse.json({ error: "invalid_action" }, { status: 400 });
}
