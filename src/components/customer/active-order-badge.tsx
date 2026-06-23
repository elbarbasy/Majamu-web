"use client";

import Link from "next/link";
import { ArrowRight, ChefHat, RefreshCw, Wallet } from "lucide-react";

import { useActiveOrderStore } from "@/stores/active-order-store";
import type { OrderStatus } from "@/types";

/**
 * Sticky bottom card — alur berbeda per status pesanan:
 * - menunggu_bayar: "Pembayaran Tunai — Tunjukkan ke Kasir →"
 * - diterima/diracik/siap_diambil: "Pesanan Sedang Diproses — Lihat Status →"
 * - selesai: "Pesan Lagi →"
 * Konsisten dengan branding Majamu.
 */
export function ActiveOrderBadge() {
  const statusUrl = useActiveOrderStore((s) => s.statusUrl);
  const currentStatus = useActiveOrderStore((s) => s.currentStatus);
  const displayNumber = useActiveOrderStore((s) => s.displayNumber);

  if (!statusUrl || !currentStatus) return null;

  // Selesai → "Pesan Lagi"
  if (currentStatus === "selesai") {
    return (
      <Link
        href="/"
        className="flex items-center justify-between gap-3 rounded-card border border-[rgba(107,79,58,0.15)] bg-white px-5 py-4 shadow-soft transition active:scale-[0.99]"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#A3B18A]/15 text-[#A3B18A]">
            <RefreshCw className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-[#4E342E]">
            Pesanan Selesai
          </span>
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold text-[#6B4F3A]">
          Pesan Lagi
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    );
  }

  // Menunggu Bayar → "Pembayaran Tunai"
  if (currentStatus === "menunggu_bayar") {
    return (
      <Link
        href={`/order/${statusUrl}`}
        className="flex items-center gap-4 rounded-card border border-[rgba(107,79,58,0.15)] bg-white px-5 py-4 shadow-soft transition active:scale-[0.99]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E6AA2C]/15 text-[#E6AA2C]">
          <Wallet className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-[#4E342E]">
            Pembayaran Tunai
          </span>
          <span className="block text-xs text-[#7A7A7A]">
            Tunjukkan pesanan ini kepada kasir
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#6B4F3A]">
          Tunjukkan
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    );
  }

  // Diterima / Diracik / Siap Diambil → "Pesanan Sedang Diproses"
  const STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
    diterima: "Pesanan Diterima",
    diracik: "Sedang Diracik",
    siap_diambil: "Siap Diambil",
  };

  return (
    <Link
      href={`/order/${statusUrl}`}
      className="flex items-center gap-4 rounded-card border border-[rgba(107,79,58,0.15)] bg-white px-5 py-4 shadow-soft transition active:scale-[0.99]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A3B18A]/15 text-[#A3B18A]">
        <ChefHat className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[#4E342E]">
          {STATUS_LABEL[currentStatus] ?? "Pesanan Diproses"}
        </span>
        {displayNumber && (
          <span className="block text-xs text-[#7A7A7A]">{displayNumber}</span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#6B4F3A]">
        Lihat Status
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
