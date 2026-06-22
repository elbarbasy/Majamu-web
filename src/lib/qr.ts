/**
 * Helper QR (OWNER_UI.md: Generate/Download QR Meja; RECEIPT_SYSTEM.md: QR Tracking).
 *
 * PENTING: NEXT_PUBLIC_APP_URL harus diset di Vercel env agar URL QR benar.
 * Jika tidak diset → fallback ke window.location.origin (hanya OK jika
 * Owner membuka dari domain yang sama dengan pelanggan).
 */

function appBase(): string {
  // NEXT_PUBLIC_* tersedia di client bundle Next.js.
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl !== "http://localhost:3000") return envUrl;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/** URL tujuan QR untuk sebuah meja: {APP_URL}/table/{n}. */
export function buildTableUrl(tableNumber: number): string {
  return `${appBase()}/table/${tableNumber}`;
}

/** URL tracking pesanan: {APP_URL}/order/{statusUrl} (RECEIPT_SYSTEM.md). */
export function buildTrackingUrl(statusUrl: string): string {
  return `${appBase()}/order/${statusUrl}`;
}

/**
 * URL gambar QR (PNG) via layanan publik. Dirender di browser pengguna
 * (bukan sandbox) sehingga berfungsi di produksi. Ukuran dalam piksel.
 */
export function qrImageUrl(data: string, size = 240): string {
  const enc = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${enc}`;
}
