"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { statusLabel } from "@/constants";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { useActiveOrderStore } from "@/stores/active-order-store";
import { useCustomerHistoryStore } from "@/stores/customer-history-store";
import type { CustomerHistoryOrder } from "@/types";

function HistoryCard({
  order,
  pinned = false,
}: {
  order: CustomerHistoryOrder;
  pinned?: boolean;
}) {
  return (
    <Link
      href={`/order/${order.statusUrl}`}
      className={cn(
        "block rounded-card bg-surface p-4 shadow-sm",
        pinned && "border border-accent/40"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-bold text-primary">
          {pinned && <Pin className="h-3.5 w-3.5 text-accent" />}
          {order.displayNumber ?? "Pesanan"}
        </span>
        <Badge variant={pinned ? "accent" : "neutral"}>
          {statusLabel(order.status)}
        </Badge>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-black/60">
        {order.itemsSummary}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-black/45">
          {formatDateTime(order.createdAt)}
        </span>
        <span className="text-sm font-bold text-primary">
          {formatCurrency(order.totalPrice)}
        </span>
      </div>
    </Link>
  );
}

/**
 * Riwayat Pesanan (/history) — CUSTOMER_UI.md:
 * localStorage, tanpa akun, maks 30, pesanan aktif dipin di atas.
 */
export default function HistoryPage() {
  const router = useRouter();
  const orders = useCustomerHistoryStore((s) => s.orders);
  const clearHistory = useCustomerHistoryStore((s) => s.clearHistory);
  const activeStatusUrl = useActiveOrderStore((s) => s.statusUrl);
  const activeStatus = useActiveOrderStore((s) => s.currentStatus);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isActive = (o: CustomerHistoryOrder) =>
    o.statusUrl === activeStatusUrl && activeStatus !== "selesai";

  const pinned = orders.filter(isActive);
  const rest = orders.filter((o) => !isActive(o));

  return (
    <div className="px-4 py-3">
      {/* Sub-header */}
      <div className="-mx-1 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            aria-label="Kembali"
            className="touch-target flex items-center justify-center rounded-full text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-primary">Riwayat Pesanan</h1>
        </div>
        {mounted && orders.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs font-medium text-black/45 hover:text-error"
          >
            Hapus Semua
          </button>
        )}
      </div>

      {!mounted ? null : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-card bg-surface py-16 text-center shadow-sm">
          <ClipboardList className="h-12 w-12 text-secondary" />
          <p className="text-sm font-medium text-black/60">
            Belum ada riwayat pesanan.
          </p>
          <Link href="/">
            <Button variant="outline">Mulai Pesan</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pinned.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                Pesanan Aktif
              </p>
              {pinned.map((o) => (
                <HistoryCard key={o.orderId} order={o} pinned />
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <div className="space-y-2">
              {pinned.length > 0 && (
                <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-black/40">
                  Riwayat
                </p>
              )}
              {rest.map((o) => (
                <HistoryCard key={o.orderId} order={o} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
