/**
 * Midtrans helper (SERVER-ONLY).
 *
 * Memakai Snap API. Env:
 *   MIDTRANS_SERVER_KEY        (rahasia, server)
 *   MIDTRANS_IS_PRODUCTION     ("true" untuk produksi; default sandbox)
 *
 * Jangan impor file ini dari komponen client.
 */
import crypto from "crypto";

const SNAP_URL_PROD = "https://app.midtrans.com/snap/v1/transactions";
const SNAP_URL_SANDBOX = "https://app.sandbox.midtrans.com/snap/v1/transactions";

function isProduction(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

function snapUrl(): string {
  return isProduction() ? SNAP_URL_PROD : SNAP_URL_SANDBOX;
}

export function midtransConfigured(): boolean {
  return Boolean(process.env.MIDTRANS_SERVER_KEY);
}

export interface SnapItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface CreateSnapParams {
  orderId: string;
  grossAmount: number;
  items: SnapItem[];
  customerName?: string;
  customerPhone?: string;
}

/** Buat transaksi Snap, kembalikan token & redirect_url. */
export async function createSnapTransaction(
  params: CreateSnapParams
): Promise<{ token: string; redirectUrl: string }> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY belum diset");

  const auth = Buffer.from(`${serverKey}:`).toString("base64");
  const body = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: Math.round(params.grossAmount),
    },
    item_details: params.items.map((i) => ({
      id: i.id,
      price: Math.round(i.price),
      quantity: i.quantity,
      name: i.name.slice(0, 50),
    })),
    customer_details: {
      first_name: params.customerName || "Pelanggan",
      phone: params.customerPhone || undefined,
    },
    credit_card: { secure: true },
  };

  const res = await fetch(snapUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Midtrans Snap error ${res.status}: ${text}`);
  }
  const data = (await res.json()) as { token: string; redirect_url: string };
  return { token: data.token, redirectUrl: data.redirect_url };
}

/** Verifikasi signature notifikasi (sha512). */
export function verifySignature(payload: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return false;
  const raw =
    payload.order_id + payload.status_code + payload.gross_amount + serverKey;
  const hash = crypto.createHash("sha512").update(raw).digest("hex");
  return hash === payload.signature_key;
}

/** Petakan status transaksi Midtrans ke status pembayaran internal. */
export function mapTransactionStatus(
  transactionStatus: string,
  fraudStatus?: string
): "paid" | "pending" | "failed" {
  if (transactionStatus === "capture") {
    return fraudStatus === "challenge" ? "pending" : "paid";
  }
  if (transactionStatus === "settlement") return "paid";
  if (transactionStatus === "pending") return "pending";
  // deny | cancel | expire | failure
  return "failed";
}
