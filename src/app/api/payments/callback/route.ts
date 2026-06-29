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
      "id, status, status_url, receipt_number, customer_name, whatsapp, total_price, display_number, payment_method"
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
    
    // Update status order
    await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", order.id);

    // Catat riwayat status
    await supabase
      .from("order_status_history")
      .insert({ order_id: order.id, status: "diterima" });
    
    // Catat riwayat status ke 'diracik' juga jika perlu, atau biarkan logic ini menangani transisi
    await supabase
      .from("order_status_history")
      .insert({ order_id: order.id, status: nextStatus });

    // Kirim struk WhatsApp otomatis untuk pembayaran QRIS yang berhasil.
    // Dikirim selama payment sukses (paid), terlepas dari status order sebelumnya.
    if (order.whatsapp) {
      if (!fonnteConfigured()) {
        console.warn(
          "[callback] FONNTE_TOKEN tidak diset — struk WA tidak terkirim untuk order:",
          order.receipt_number
        );
      } else {
        // Cek apakah WA sudah dikirim (oleh client fallback yang lebih cepat).
        const { data: payment } = await supabase
          .from("payments")
          .select("wa_sent_at")
          .eq("order_id", order.id)
          .maybeSingle();

        if (payment?.wa_sent_at) {
          console.info("[callback] WA sudah dikirim sebelumnya untuk:", order.receipt_number);
        } else {
          const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
          const message = buildOrderWhatsApp({
            name: order.customer_name ?? "",
            orderNumber: order.display_number ?? "",
            receiptNumber: order.receipt_number ?? "",
            total: rupiah(Number(order.total_price) || 0),
            receiptUrl: `${base}/receipt/${order.receipt_number}`,
            statusUrl: `${base}/order/${order.status_url}`,
            paymentMethod: order.payment_method ?? undefined,
          });
          const result = await sendWhatsApp(order.whatsapp, message);
          console.info(
            "[callback] WhatsApp struk untuk",
            order.receipt_number,
            "→",
            result.sent ? "TERKIRIM" : "GAGAL",
            result.response ?? ""
          );

          // Tandai wa_sent_at agar tidak dikirim ganda oleh client fallback.
          if (result.sent) {
            await supabase
              .from("payments")
              .update({ wa_sent_at: new Date().toISOString() })
              .eq("order_id", order.id);
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}