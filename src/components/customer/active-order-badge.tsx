"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

import { statusLabel } from "@/constants";
import { useActiveOrderStore } from "@/stores/active-order-store";

/**
 * Badge Pesanan Aktif (CUSTOMER_UI.md: bottom fixed, dipin).
 * Mengarah ke halaman tracking via status_url.
 */
export function ActiveOrderBadge() {
  const statusUrl = useActiveOrderStore((s) => s.statusUrl);
  const currentStatus = useActiveOrderStore((s) => s.currentStatus);
  const displayNumber = useActiveOrderStore((s) => s.displayNumber);

  if (!statusUrl || !currentStatus || currentStatus === "selesai") return null;

  return (
    <Link
      href={`/order/${statusUrl}`}
      className="flex items-center justify-between gap-3 rounded-card border border-accent/30 bg-accent/12 px-5 py-3 text-accent shadow-soft"
    >
      <span className="flex items-center gap-2">
        <Clock className="h-5 w-5" />
        <span className="text-sm font-semibold">
          Pesanan Aktif{displayNumber ? ` • ${displayNumber}` : ""}
        </span>
      </span>
      <span className="text-xs font-bold uppercase tracking-wide">
        {statusLabel(currentStatus)}
      </span>
    </Link>
  );
}
