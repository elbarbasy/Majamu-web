"use client";

import { Check } from "lucide-react";

import { ORDER_STATUS_STEPS } from "@/constants";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

interface StatusTimelineProps {
  status: OrderStatus;
}

/**
 * Timeline status pesanan (aturan wajib: tracking pakai timeline status).
 * Urutan: Menunggu Bayar -> Diterima -> Diracik -> Siap Diambil -> Selesai.
 */
export function StatusTimeline({ status }: StatusTimelineProps) {
  const currentIndex = ORDER_STATUS_STEPS.findIndex((s) => s.value === status);

  return (
    <ol className="relative ml-3">
      {ORDER_STATUS_STEPS.map((step, idx) => {
        const done = idx < currentIndex;
        const active = idx === currentIndex;
        const isLast = idx === ORDER_STATUS_STEPS.length - 1;

        return (
          <li key={step.value} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Garis penghubung */}
            {!isLast && (
              <span
                className={cn(
                  "absolute left-[11px] top-6 h-full w-0.5",
                  done ? "bg-accent" : "bg-black/10"
                )}
                aria-hidden
              />
            )}
            {/* Titik */}
            <span
              className={cn(
                "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                done && "border-accent bg-accent text-accent-foreground",
                active && "border-primary bg-primary text-primary-foreground",
                !done && !active && "border-black/15 bg-surface"
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    active ? "bg-primary-foreground" : "bg-black/20"
                  )}
                />
              )}
            </span>
            {/* Label */}
            <div className="-mt-0.5">
              <p
                className={cn(
                  "text-sm font-semibold",
                  active ? "text-primary" : done ? "text-accent" : "text-black/50"
                )}
              >
                {step.label}
              </p>
              {active && (
                <p className="text-xs text-black/50">Status saat ini</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
