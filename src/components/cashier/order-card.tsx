"use client";

import { AlertTriangle, MessageSquareText, Utensils } from "lucide-react";

import { OrderTimer } from "@/components/cashier/order-timer";
import { Button } from "@/components/ui/button";
import {
  CASHIER_ACTION,
  CASHIER_STATUS_STYLE,
  URGENCY_THRESHOLD_MINUTES,
  orderTypeLabel,
  sweetnessLabel,
  temperatureLabel,
} from "@/constants";
import { cn, formatCurrency } from "@/lib/utils";
import type { CashierOrder, OrderStatus } from "@/types";

interface OrderCardProps {
  order: CashierOrder;
  now: number;
  onAdvance: (order: CashierOrder, next: OrderStatus) => void;
  isNew?: boolean;
  busy?: boolean;
}

/**
 * Order Card BESAR — warna status fungsional, timer, kustomisasi (suhu/manis),
 * badge BARU + glow (30 dtk), penanda urgent (timer melewati ambang).
 */
export function OrderCard({ order, now, onAdvance, isNew, busy }: OrderCardProps) {
  const action = CASHIER_ACTION[order.status];
  const isTakeAway = order.orderType === "take_away";
  const style = CASHIER_STATUS_STYLE[order.status];

  const elapsedMin = Math.floor(
    Math.max(0, now - new Date(order.createdAt).getTime()) / 60000
  );
  const urgent =
    order.status !== "selesai" && elapsedMin >= URGENCY_THRESHOLD_MINUTES;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-card bg-surface shadow-md ring-1 transition-all",
        isNew
          ? "ring-2 ring-amber-400 shadow-soft-lg"
          : urgent
            ? "ring-2 ring-red-400"
            : "ring-black/5"
      )}
    >
      {/* Strip warna status */}
      <div className={cn("h-1.5 w-full", urgent ? "bg-red-500" : style.bar)} />

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
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-bold",
                style.badge
              )}
            >
              {style.label}
            </span>
            {isNew && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                Baru
              </span>
            )}
            {urgent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                <AlertTriangle className="h-3 w-3" />
                Urgent
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <OrderTimer createdAt={order.createdAt} now={now} />
          <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-medium text-black/60">
            <Utensils className="h-3 w-3" />
            {orderTypeLabel(order.orderType)}
          </span>
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
                  {item.temperature && (
                    <p className="text-xs font-semibold text-primary">
                      Suhu: {temperatureLabel(item.temperature)}
                    </p>
                  )}
                  {item.sweetnessLevel && (
                    <p className="text-xs font-semibold text-accent">
                      Manis: {sweetnessLabel(item.sweetnessLevel)}
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

        {order.notes && (
          <div className="mt-3 flex items-start gap-2 rounded-card bg-amber-50 p-3">
            <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-700">{order.notes}</p>
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

        {action && (
          <Button
            block
            size="lg"
            disabled={busy}
            variant={order.status === "siap_diambil" ? "accent" : "primary"}
            onClick={() => onAdvance(order, action.next)}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
