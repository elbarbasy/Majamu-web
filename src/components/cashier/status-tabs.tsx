"use client";

import { CASHIER_STATUS_STYLE, CASHIER_STATUS_TABS } from "@/constants";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

type TabValue = OrderStatus | "all";

interface StatusTabsProps {
  active: TabValue;
  counts: Record<TabValue, number>;
  onSelect: (value: TabValue) => void;
}

/**
 * Tab Status board kasir dengan WARNA FUNGSIONAL per status.
 * Tab aktif memakai warna solid status (Semua = primary). Tab non-aktif
 * memakai titik warna + tint, sehingga status mudah dikenali sekilas.
 */
export function StatusTabs({ active, counts, onSelect }: StatusTabsProps) {
  return (
    <div className="sticky top-16 z-20 border-b border-black/5 bg-background/95 backdrop-blur">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {CASHIER_STATUS_TABS.map((tab) => {
          const isActive = tab.value === active;
          const count = counts[tab.value] ?? 0;
          const style =
            tab.value === "all"
              ? null
              : CASHIER_STATUS_STYLE[tab.value as OrderStatus];

          // Tab aktif
          if (isActive) {
            return (
              <button
                key={tab.value}
                onClick={() => onSelect(tab.value)}
                className={cn(
                  "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold shadow-sm",
                  style
                    ? style.solid
                    : "border-primary bg-primary text-primary-foreground"
                )}
              >
                {tab.label}
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/25 px-1 text-xs font-bold">
                  {count}
                </span>
              </button>
            );
          }

          // Tab non-aktif
          return (
            <button
              key={tab.value}
              onClick={() => onSelect(tab.value)}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-black/10 bg-surface px-4 py-2 text-sm font-semibold text-black/70 transition-colors hover:border-black/20"
            >
              {style && (
                <span className={cn("h-2.5 w-2.5 rounded-full", style.dot)} />
              )}
              {tab.label}
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black/10 px-1 text-xs font-bold text-black/60">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
