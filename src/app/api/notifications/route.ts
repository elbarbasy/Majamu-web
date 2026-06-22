/**
 * POST /api/notifications — kirim struk/notifikasi via WhatsApp (Fonnte).
 * Dipanggil setelah order berhasil dibuat.
 * Body: { whatsapp, customerName, orderNumber, receiptNumber, total, receiptUrl, statusUrl }
 *
 * Response selalu 200 (fire-and-forget) dengan detail { sent, reason?, fonnteResponse? }
 */
import { NextResponse } from "next/server";

import {
  buildOrderWhatsApp,
  fonnteConfigured,
  sendWhatsApp,
} from "@/lib/fonnte";

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
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ sent: false, reason: "invalid body" }, { status: 400 });
  }

  const { whatsapp, customerName, orderNumber, receiptNumber, total, receiptUrl, statusUrl } = body;
  if (!whatsapp) {
    return NextResponse.json({ sent: false, reason: "no whatsapp number" });
  }

  const message = buildOrderWhatsApp({
    name: customerName ?? "",
    orderNumber: orderNumber ?? "",
    receiptNumber: receiptNumber ?? "",
    total: total ?? "",
    receiptUrl: receiptUrl ?? "",
    statusUrl: statusUrl ?? "",
  });

  const result = await sendWhatsApp(whatsapp, message);

  return NextResponse.json({
    sent: result.sent,
    fonnteStatus: result.status,
    fonnteResponse: result.response,
  });
}
