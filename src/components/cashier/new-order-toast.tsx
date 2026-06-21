"use client";

import * as React from "react";
import { BellRing } from "lucide-react";

/**
 * Notifikasi Order Baru (CASHIER_UI.md "Notifikasi Order Baru").
 * Muncul singkat ketika jumlah order bertambah.
 */
export function NewOrderToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-20 z-40 -translate-x-1/2 animate-fade-in">
      <div className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg">
        <BellRing className="h-4 w-4" />
        Pesanan baru masuk
      </div>
    </div>
  );
}
