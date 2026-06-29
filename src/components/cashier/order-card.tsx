"use client";

import { AlertTriangle, MessageSquareText, Utensils } from "lucide-react";

import { OrderTimer } from "@/components/cashier/order-timer";
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
 * Order Card BESAR — warna status fungsional yang JELAS:
 * border berwarna + header ter-tint + badge. Tombol aksi mengikuti warna
 * status kartu. Penanda BARU (glow 30 dtk) & Urgent (merah).
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
        "flex flex-col overflow-hidden rounded-card border-2 bg-surface shadow-md transition-all",
        isNew
          ? "border-amber-400 ring-4 ring-amber-200 shadow-soft-lg"
          : urgent
            ? "border-red-400 ring-2 ring-red-100"
            : style.border
      )}
    >
      {/* Header ter-tint warna status */}
      <div
        className={cn(
          "flex items-start justify-between gap-2 border-b p-4",
          urgent ? "border-red-100 bg-red-50" : cn("border-black/5", style.tint)
        )}
      >
        <div className="min-w-0">
          <p className="text-2xl font-extrabold leading-tight text-primary">
            {order.displayNumber ?? "-"}
          </p>
          {order.customerName && (
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
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E6AA2C]/15 px-2.5 py-0.5 text-xs font-semibold text-[#5B3E2A]">
            {order.paymentMethod === "qris" ? "QRIS" : "Tunai"}
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

      {/* Footer: total + aksi (warna mengikuti status) */}
      <div className={cn("border-t border-black/5 p-4", style.tint)}>
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

        {/* Untuk QRIS: status menunggu_bayar hanya sementara (menunggu callback Midtrans).
            Kasir tidak perlu konfirmasi manual — tampilkan info saja. */}
        {order.status === "menunggu_bayar" &&
        (order.paymentMethod === "qris" || order.paymentMethod === "midtrans") ? (
          <div className="flex h-12 w-full items-center justify-center rounded-btn border border-amber-300 bg-amber-50 text-sm font-semibold text-amber-700">
            ⏳ Menunggu pembayaran QRIS...
          </div>
        ) : (
          action && (
            <button
              disabled={busy}
              onClick={() => onAdvance(order, action.next)}
              className={cn(
                "flex h-12 w-full items-center justify-center rounded-btn border text-sm font-bold shadow-soft-sm transition active:scale-[0.99] disabled:opacity-50",
                style.solid
              )}
            >
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}