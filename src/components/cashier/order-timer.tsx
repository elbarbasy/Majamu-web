"use client";

import { Clock } from "lucide-react";

import { URGENCY_THRESHOLD_MINUTES } from "@/constants";
import { cn } from "@/lib/utils";

interface OrderTimerProps {
  createdAt: string;
  now: number;
}

/**
 * Timer Waktu Tunggu per order (CASHIER_UI.md). Menampilkan mm:ss elapsed.
 * Berubah merah bila melewati ambang urgensi (store_settings).
 */
export function OrderTimer({ createdAt, now }: OrderTimerProps) {
  const elapsedMs = Math.max(0, now - new Date(createdAt).getTime());
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const urgent = minutes >= URGENCY_THRESHOLD_MINUTES;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold tabular-nums",
        urgent ? "bg-error/10 text-error" : "bg-black/5 text-black/60"
      )}
    >
      <Clock className="h-4 w-4" />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}
