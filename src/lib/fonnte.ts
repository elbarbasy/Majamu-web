/**
 * Fonnte WhatsApp helper (SERVER-ONLY).
 * Env: FONNTE_TOKEN (token device dari dashboard Fonnte).
 *
 * API Fonnte: https://md.fonnte.com/api-send
 * Header: Authorization = token device (TANPA prefix Bearer).
 */

export function fonnteConfigured(): boolean {
  return Boolean(process.env.FONNTE_TOKEN);
}

/** Normalkan nomor WhatsApp Indonesia ke format 62xxxx. */
export function normalizeWhatsapp(raw: string): string {
  let n = (raw || "").replace(/[^0-9]/g, "");
  if (n.startsWith("08")) n = "62" + n.slice(1);
  else if (n.startsWith("8")) n = "62" + n;
  // Jika sudah dimulai 62, biarkan.
  return n;
}

export interface FonnteResult {
  sent: boolean;
  status?: number;
  response?: string;
}

/** Kirim pesan WhatsApp via Fonnte. */
export async function sendWhatsApp(
  target: string,
  message: string
): Promise<FonnteResult> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    console.warn("[fonnte] FONNTE_TOKEN not set");
    return { sent: false, response: "FONNTE_TOKEN not configured" };
  }

  const normalizedTarget = normalizeWhatsapp(target);
  console.info("[fonnte] Sending to:", normalizedTarget);

  try {
    const formData = new URLSearchParams();
    formData.append("target", normalizedTarget);
    formData.append("message", message);
    formData.append("countryCode", "62");

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const text = await res.text();
    console.info("[fonnte] Response:", res.status, text);

    if (!res.ok) {
      return { sent: false, status: res.status, response: text };
    }

    // Fonnte mengembalikan JSON { status: true/false, ... }
    try {
      const json = JSON.parse(text);
      return { sent: json.status === true, status: res.status, response: text };
    } catch {
      return { sent: res.ok, status: res.status, response: text };
    }
  } catch (err) {
    console.error("[fonnte] Error:", err);
    return { sent: false, response: String(err) };
  }
}

/** Template pesan pesanan (RECEIPT_SYSTEM.md WhatsApp Template). */
export function buildOrderWhatsApp(p: {
  name?: string;
  orderNumber: string;
  receiptNumber: string;
  total: string;
  receiptUrl: string;
  statusUrl: string;
  paymentMethod?: string;
}): string {
  const paymentInfo =
    p.paymentMethod === "qris" || p.paymentMethod === "midtrans"
      ? "Pembayaran QRIS berhasil! Pesanan Anda di Majamu telah dikonfirmasi."
      : "Pesanan Anda di Majamu telah dikonfirmasi.";

  return [
    `Halo ${p.name ?? ""}`.trim() + ",",
    "",
    paymentInfo,
    "",
    `No Order: ${p.orderNumber}`,
    `No Struk: ${p.receiptNumber}`,
    `Total: ${p.total}`,
    ...(p.paymentMethod === "qris" || p.paymentMethod === "midtrans"
      ? [`Pembayaran: QRIS (Lunas)`]
      : []),
    "",
    `Struk: ${p.receiptUrl}`,
    "",
    `Status Pesanan: ${p.statusUrl}`,
    "",
    "Terima kasih telah memesan di Majamu!",
  ].join("\n");
}
