/**
 * POST /api/scan-payment — kasir scan QR / input payment code.
 * Body: { paymentCode: string, action: "lookup" | "confirm" }
 *
 * lookup: cari order by payment_code, return info.
 * confirm: update status → diracik + kirim WA.
 */
import { NextResponse } from "next/server";

import { buildOrderWhatsApp, fonnteConfigured, sendWhatsApp } from "@/lib/fonnte";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function rupiah(v: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(v || 0);
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

  let supabase: ReturnType<typeof createServiceRoleClient>;
  try { supabase = createServiceRoleClient(); } catch {
    return NextResponse.json({ error: "server_not_configured" }, { status: 501 });
  }

  // Lookup order by payment_code OR receipt_number (fallback jika kolom belum ada)
  let order: Record<string, unknown> | null = null;
  let lookupError: unknown = null;

  // Coba payment_code dulu
  const { data: d1, error: e1 } = await supabase
    .from("orders")
    .select("id, display_number, customer_name, whatsapp, total_price, status, status_url, receipt_number, payment_method")
    .eq("payment_code", paymentCode)
    .maybeSingle();

  if (d1) {
    order = d1 as Record<string, unknown>;
  } else {
    // Fallback: cari by receipt_number (payment code = receipt number)
    const { data: d2, error: e2 } = await supabase
      .from("orders")
      .select("id, display_number, customer_name, whatsapp, total_price, status, status_url, receipt_number, payment_method")
      .eq("receipt_number", paymentCode)
      .maybeSingle();
    if (d2) order = d2 as Record<string, unknown>;
    lookupError = e1 || e2;
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

    const { data: updated, error: updErr } = await supabase
      .from("orders")
      .update({ status: "diterima" })
      .eq("id", String(order.id))
      .select("id, status");

    if (updErr) {
      return NextResponse.json(
        { error: "update_failed", detail: updErr.message },
        { status: 500 }
      );
    }

    // 0 baris ter-update = RLS memblokir (kemungkinan SUPABASE_SERVICE_ROLE_KEY
    // salah/diisi anon key, sehingga tidak melewati RLS).
    if (!updated || updated.length === 0) {
      return NextResponse.json(
        {
          error: "update_no_rows",
          detail:
            "Update tidak mengubah baris (RLS). Periksa SUPABASE_SERVICE_ROLE_KEY harus service_role asli, bukan anon key.",
        },
        { status: 403 }
      );
    }

    await supabase
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

  // Action: cancel (auto-cancel when payment countdown expires)
  if (action === "cancel") {
    if (order.status !== "menunggu_bayar") {
      return NextResponse.json({ error: "not_cancellable", status: order.status });
    }

    const { data: cancelled, error: cancelErr } = await supabase
      .from("orders")
      .update({ status: "dibatalkan" })
      .eq("id", String(order.id))
      .select("id");

    if (cancelErr) {
      return NextResponse.json(
        { error: "update_failed", detail: cancelErr.message },
        { status: 500 }
      );
    }
    if (!cancelled || cancelled.length === 0) {
      return NextResponse.json(
        { error: "update_no_rows", detail: "RLS memblokir update (cek SERVICE_ROLE_KEY)." },
        { status: 403 }
      );
    }

    await supabase
      .from("order_status_history")
      .insert({ order_id: String(order.id), status: "dibatalkan" });

    return NextResponse.json({ success: true, newStatus: "dibatalkan" });
  }

  return NextResponse.json({ error: "invalid_action" }, { status: 400 });
}
