"use client";

import { MessageSquareText, Utensils } from "lucide-react";

import { OrderTimer } from "@/components/cashier/order-timer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CASHIER_ACTION, orderTypeLabel, statusLabel, sweetnessLabel } from "@/constants";
import { cn, formatCurrency } from "@/lib/utils";
import type { CashierOrder, OrderStatus } from "@/types";

interface OrderCardProps {
  order: CashierOrder;
  now: number;
  onAdvance: (orderId: string, next: OrderStatus) => void;
  busy?: boolean;
}

const STATUS_BADGE: Record<
  OrderStatus,
  "warning" | "primary" | "accent" | "success" | "neutral"
> = {
  menunggu_bayar: "warning",
  diterima: "primary",
  diracik: "accent",
  siap_diambil: "success",
  selesai: "neutral",
};

/**
 * Order Card BESAR (CASHIER_UI.md). Menampilkan nomor meja/antrian, badge
 * dine in/take away, timer, daftar produk + kustomisasi, catatan pelanggan,
 * total harga, dan tombol aksi sesuai status.
 */
export function OrderCard({ order, now, onAdvance, busy }: OrderCardProps) {
  const action = CASHIER_ACTION[order.status];
  const isTakeAway = order.orderType === "take_away";

  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-surface shadow-md ring-1 ring-black/5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-black/5 p-4">
        <div className="min-w-0">
          <p className="text-2xl font-extrabold leading-tight text-primary">
            {order.displayNumber ?? "-"}
          </p>
          {isTakeAway && order.customerName && (
            <p className="mt-0.5 truncate text-sm font-medium text-black/60">
              {order.customerName}
            </p>
          )}
          <span className="mt-1.5 inline-flex">
            <Badge variant={STATUS_BADGE[order.status]}>
              {statusLabel(order.status)}
            </Badge>
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <OrderTimer createdAt={order.createdAt} now={now} />
          <Badge variant={isTakeAway ? "secondary" : "primary"}>
            <Utensils className="h-3 w-3" />
            {orderTypeLabel(order.orderType)}
          </Badge>
        </div>
      </div>

      {/* Daftar produk */}
      <div className="flex-1 p-4">
        <ul className="space-y-2.5">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <span className="mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-md bg-primary/10 px-1 text-sm font-bold text-primary">
                  {item.quantity}
                </span>
                <div className="min-w-0">
                  <p className="text-base font-semibold leading-tight text-black/85">
                    {item.name}
                  </p>
                  {item.sweetnessLevel && (
                    <p className="text-xs font-medium text-accent">
                      {sweetnessLabel(item.sweetnessLevel)}
                    </p>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-sm font-medium text-black/60">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        {/* Catatan pelanggan */}
        {order.notes && (
          <div className="mt-3 flex items-start gap-2 rounded-card bg-warning/10 p-3">
            <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-sm text-warning">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Footer: total + aksi */}
      <div className="border-t border-black/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-black/55">Total</span>
          <span
            className={cn(
              "font-extrabold text-primary",
              order.status === "menunggu_bayar" ? "text-2xl" : "text-lg"
            )}
          >
            {formatCurrency(order.totalPrice)}
          </span>
        </div>

        {action ? (
          <Button
            block
            size="lg"
            disabled={busy}
            variant={order.status === "siap_diambil" ? "accent" : "primary"}
            onClick={() => onAdvance(order.id, action.next)}
          >
            {action.label}
          </Button>
        ) : (
          <Badge variant={STATUS_BADGE[order.status]}>Selesai</Badge>
        )}
      </div>
    </div>
  );
}
