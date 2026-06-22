/**
 * POST /api/notifications — kirim struk/notifikasi via WhatsApp (Fonnte).
 * Dipanggil setelah order berhasil dibuat (client-side trigger).
 * Body: { whatsapp, customerName, orderNumber, receiptNumber, total, receiptUrl, statusUrl }
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
    return NextResponse.json(
      { sent: false, reason: "FONNTE_TOKEN not configured" },
      { status: 200 }
    );
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
    return NextResponse.json({ sent: false, reason: "no whatsapp" }, { status: 400 });
  }

  const message = buildOrderWhatsApp({
    name: customerName ?? "",
    orderNumber: orderNumber ?? "",
    receiptNumber: receiptNumber ?? "",
    total: total ?? "",
    receiptUrl: receiptUrl ?? "",
    statusUrl: statusUrl ?? "",
  });

  const ok = await sendWhatsApp(whatsapp, message);
  return NextResponse.json({ sent: ok });
}
