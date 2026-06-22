"use client";

import Link from "next/link";
import { ArrowRight, ChefHat } from "lucide-react";

import { useActiveOrderStore } from "@/stores/active-order-store";
import type { OrderStatus } from "@/types";

/** Teks badge per status pesanan aktif. */
const ACTIVE_LABEL: Record<OrderStatus, string> = {
  menunggu_bayar: "Tunjukkan ke Kasir",
  diterima: "Pesanan Diterima",
  diracik: "Sedang Diracik",
  siap_diambil: "Siap Diambil",
  selesai: "Selesai",
};

/**
 * Badge pesanan aktif — kartu fixed di atas floating cart.
 * Teks menyesuaikan status; mengarah ke halaman tracking (logika tetap).
 */
export function ActiveOrderBadge() {
  const statusUrl = useActiveOrderStore((s) => s.statusUrl);
  const currentStatus = useActiveOrderStore((s) => s.currentStatus);
  const displayNumber = useActiveOrderStore((s) => s.displayNumber);

  if (!statusUrl || !currentStatus || currentStatus === "selesai") return null;

  return (
    <Link
      href={`/order/${statusUrl}`}
      className="flex items-center justify-between gap-3 rounded-card border border-accent/30 bg-surface px-4 py-3 shadow-soft transition active:scale-[0.99]"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <ChefHat className="h-5 w-5" />
        </span>
        <span className="leading-tight">
          <span className="block text-[13px] font-extrabold text-accent">
            {ACTIVE_LABEL[currentStatus]}
          </span>
          {displayNumber && (
            <span className="block text-xs text-muted">{displayNumber}</span>
          )}
        </span>
      </span>
      <span className="flex items-center gap-1 text-sm font-bold text-primary">
        Lihat Pesanan
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
