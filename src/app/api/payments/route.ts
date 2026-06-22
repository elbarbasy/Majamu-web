/**
 * POST /api/payments — buat transaksi Midtrans Snap untuk sebuah order.
 * Body: { orderId: string }. Mengembalikan { token, redirectUrl }.
 */
import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { createSnapTransaction, midtransConfigured } from "@/lib/midtrans";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!midtransConfigured()) {
    return NextResponse.json(
      { error: "midtrans_not_configured" },
      { status: 501 }
    );
  }

  let orderId: string | undefined;
  try {
    const body = await request.json();
    orderId = body?.orderId;
  } catch {
    /* ignore */
  }
  if (!orderId) {
    return NextResponse.json({ error: "orderId_required" }, { status: 400 });
  }

  let supabase: ReturnType<typeof createServiceRoleClient>;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "server_not_configured" }, { status: 501 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, receipt_number, total_price, customer_name, whatsapp, payment_method")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, product_name_snapshot, price_snapshot, quantity")
    .eq("order_id", order.id);

  const snapItems = (items ?? []).map((i, idx) => ({
    id: i.product_id ?? `item-${idx}`,
    name: i.product_name_snapshot ?? "Produk",
    price: Number(i.price_snapshot) || 0,
    quantity: i.quantity ?? 1,
  }));

  const grossAmount =
    Number(order.total_price) ||
    snapItems.reduce((s, i) => s + i.price * i.quantity, 0);

  try {
    const { token, redirectUrl } = await createSnapTransaction({
      // Pakai receipt_number sebagai order_id Midtrans (unik per transaksi).
      orderId: order.receipt_number ?? order.id,
      grossAmount,
      items: snapItems,
      customerName: order.customer_name ?? undefined,
      customerPhone: order.whatsapp ?? undefined,
      // QRIS via Midtrans (QR mencakup QRIS/GoPay/ShopeePay).
      enabledPayments: ["qris", "gopay", "shopeepay", "other_qris"],
    });

    await supabase.from("payments").insert({
      order_id: order.id,
      method: order.payment_method ?? "qris",
      status: "pending",
      amount: grossAmount,
    });

    return NextResponse.json({ token, redirectUrl });
  } catch (err) {
    return NextResponse.json(
      { error: "midtrans_error", message: String(err) },
      { status: 502 }
    );
  }
}
