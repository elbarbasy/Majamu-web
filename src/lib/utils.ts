import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gabungkan className Tailwind dengan aman (clsx + tailwind-merge). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format angka ke Rupiah, mis. 15000 -> "Rp15.000". */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

/** Format tanggal ringkas Indonesia. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "-";
  }
}

/** Selisih menit dari sebuah timestamp ke sekarang (untuk waktu tunggu). */
export function minutesSince(iso: string | null | undefined): number {
  if (!iso) return 0;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / 60000));
}
