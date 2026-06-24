/**
 * POST /api/payments/callback — webhook notifikasi Midtrans.
 * Verifikasi signature → perbarui status payment & order → kirim WhatsApp (Fonnte).
 */
import { NextResponse } from "next/server";

import {
  buildOrderWhatsApp,
  fonnteConfigured,
  sendWhatsApp,
} from "@/lib/fonnte";
import { mapTransactionStatus, verifySignature } from "@/lib/midtrans";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function rupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

export async function POST(request: Request) {
  let payload: Record<string, string>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const valid = verifySignature({
    order_id: payload.order_id,
    status_code: payload.status_code,
    gross_amount: payload.gross_amount,
    signature_key: payload.signature_key,
  });
  if (!valid) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const paymentStatus = mapTransactionStatus(
    payload.transaction_status,
    payload.fraud_status
  );

  let supabase: ReturnType<typeof createServiceRoleClient>;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return NextResponse.json({ received: true });
  }

  // order_id Midtrans = receipt_number.
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, status, status_url, receipt_number, customer_name, whatsapp, total_price, display_number"
    )
    .eq("receipt_number", payload.order_id)
    .maybeSingle();

  if (!order) return NextResponse.json({ received: true });

  await supabase
    .from("payments")
    .update({
      status: paymentStatus,
      paid_at: paymentStatus === "paid" ? new Date().toISOString() : null,
    })
    .eq("order_id", order.id);

  if (paymentStatus === "paid" && order.status === "menunggu_bayar") {
    // QRIS sukses → langsung "diracik" (skip diterima, tidak perlu konfirmasi kasir)
    const nextStatus = "diracik";
    await supabase.from("orders").update({ status: nextStatus }).eq("id", order.id);
    await supabase
      .from("order_status_history")
      .insert({ order_id: order.id, status: nextStatus });

    if (fonnteConfigured() && order.whatsapp) {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const message = buildOrderWhatsApp({
        name: order.customer_name ?? "",
        orderNumber: order.display_number ?? "",
        receiptNumber: order.receipt_number ?? "",
        total: rupiah(Number(order.total_price) || 0),
        receiptUrl: `${base}/receipt/${order.receipt_number}`,
        statusUrl: `${base}/order/${order.status_url}`,
      });
      await sendWhatsApp(order.whatsapp, message);
    }
  }

  return NextResponse.json({ received: true });
}
