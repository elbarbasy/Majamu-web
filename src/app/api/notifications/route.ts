/**
 * POST /api/notifications — kirim struk/notifikasi via WhatsApp (Fonnte).
 * Dipanggil setelah order berhasil dibuat atau setelah QRIS sukses (fallback).
 * Body: { whatsapp, customerName, orderNumber, receiptNumber, total, receiptUrl, statusUrl, paymentMethod, orderId? }
 *
 * Untuk QRIS: cek apakah struk sudah dikirim oleh webhook (via field wa_sent_at di payments).
 * Jika sudah → skip. Jika belum → kirim dan tandai.
 *
 * Response selalu 200 (fire-and-forget) dengan detail { sent, reason?, fonnteResponse? }
 */
import { NextResponse } from "next/server";

import {
  buildOrderWhatsApp,
  fonnteConfigured,
  sendWhatsApp,
} from "@/lib/fonnte";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!fonnteConfigured()) {
    return NextResponse.json({
      sent: false,
      reason: "FONNTE_TOKEN not configured in environment variables",
    });
  }

  let body: {
    whatsapp?: string;
    customerName?: string;
    orderNumber?: string;
    receiptNumber?: string;
    total?: string;
    receiptUrl?: string;
    statusUrl?: string;
    paymentMethod?: string;
    orderId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ sent: false, reason: "invalid body" }, { status: 400 });
  }

  const { whatsapp, customerName, orderNumber, receiptNumber, total, receiptUrl, statusUrl, paymentMethod, orderId } = body;
  if (!whatsapp) {
    return NextResponse.json({ sent: false, reason: "no whatsapp number" });
  }

  // Deduplication untuk QRIS: cek apakah webhook sudah kirim WA (payments.wa_sent_at terisi).
  // Jika sudah, skip agar pelanggan tidak dapat pesan ganda.
  if ((paymentMethod === "qris" || paymentMethod === "midtrans") && orderId) {
    try {
      const supabase = createServiceRoleClient();
      const { data: payment } = await supabase
        .from("payments")
        .select("wa_sent_at")
        .eq("order_id", orderId)
        .eq("status", "paid")
        .maybeSingle();

      if (payment?.wa_sent_at) {
        return NextResponse.json({ sent: false, reason: "already_sent_by_webhook" });
      }
    } catch {
      // Jika pengecekan gagal (mis. kolom belum ada), lanjut kirim saja.
    }
  }

  const message = buildOrderWhatsApp({
    name: customerName ?? "",
    orderNumber: orderNumber ?? "",
    receiptNumber: receiptNumber ?? "",
    total: total ?? "",
    receiptUrl: receiptUrl ?? "",
    statusUrl: statusUrl ?? "",
    paymentMethod: paymentMethod ?? undefined,
  });

  const result = await sendWhatsApp(whatsapp, message);

  // Tandai wa_sent_at di payments agar webhook tidak kirim ganda.
  if (result.sent && orderId) {
    try {
      const supabase = createServiceRoleClient();
      await supabase
        .from("payments")
        .update({ wa_sent_at: new Date().toISOString() })
        .eq("order_id", orderId);
    } catch {
      // Kolom mungkin belum ada — tidak fatal.
    }
  }

  return NextResponse.json({
    sent: result.sent,
    fonnteStatus: result.status,
    fonnteResponse: result.response,
  });
}
