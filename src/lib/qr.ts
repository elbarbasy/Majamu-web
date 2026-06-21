/**
 * Helper QR Meja (OWNER_UI.md: Generate QR / Download QR).
 */

/** URL tujuan QR untuk sebuah meja: {APP_URL}/table/{n}. */
export function buildTableUrl(tableNumber: number): string {
  const base =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL) ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/table/${tableNumber}`;
}

/**
 * URL gambar QR (PNG) via layanan publik. Dirender di browser pengguna
 * (bukan sandbox) sehingga berfungsi di produksi. Ukuran dalam piksel.
 */
export function qrImageUrl(data: string, size = 240): string {
  const enc = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${enc}`;
}
