/**
 * Helper QR (OWNER_UI.md: Generate/Download QR Meja; RECEIPT_SYSTEM.md: QR Tracking).
 */

function appBase(): string {
  return (
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL) ||
    (typeof window !== "undefined" ? window.location.origin : "")
  );
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
