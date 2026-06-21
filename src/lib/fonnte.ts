/**
 * Fonnte WhatsApp helper (SERVER-ONLY).
 * Env: FONNTE_TOKEN. Dipakai untuk mengirim notifikasi pesanan/struk.
 */

export function fonnteConfigured(): boolean {
  return Boolean(process.env.FONNTE_TOKEN);
}

/** Normalkan nomor WhatsApp Indonesia ke format 62xxxx. */
export function normalizeWhatsapp(raw: string): string {
  let n = (raw || "").replace(/[^0-9]/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  if (n.startsWith("620")) n = "62" + n.slice(3);
  return n;
}

/** Kirim pesan WhatsApp via Fonnte. Mengembalikan true bila terkirim. */
export async function sendWhatsApp(
  target: string,
  message: string
): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) return false;
  try {
    const body = new URLSearchParams({
      target: normalizeWhatsapp(target),
      message,
    });
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: token },
      body,
    });
    return res.ok;
  } catch {
    return false;
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
}): string {
  return [
    `Halo ${p.name ?? ""}`.trim() + ",",
    "",
    "Pesanan Anda di Majamu telah dikonfirmasi.",
    `No Order: ${p.orderNumber}`,
    `No Struk: ${p.receiptNumber}`,
    `Total: ${p.total}`,
    "",
    `Struk: ${p.receiptUrl}`,
    `Status Pesanan: ${p.statusUrl}`,
  ].join("\n");
}
