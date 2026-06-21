"use client";

import { CASHIER_STATUS_TABS } from "@/constants";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

type TabValue = OrderStatus | "all";

interface StatusTabsProps {
  active: TabValue;
  counts: Record<TabValue, number>;
  onSelect: (value: TabValue) => void;
}

/**
 * Tab Status board kasir (CASHIER_UI.md). Sticky di atas, scroll horizontal
 * di layar sempit. Menampilkan jumlah order per status.
 */
export function StatusTabs({ active, counts, onSelect }: StatusTabsProps) {
  return (
    <div className="sticky top-16 z-20 border-b border-black/5 bg-background/95 backdrop-blur">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {CASHIER_STATUS_TABS.map((tab) => {
          const isActive = tab.value === active;
          const count = counts[tab.value] ?? 0;
          return (
            <button
              key={tab.value}
              onClick={() => onSelect(tab.value)}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-black/10 bg-surface text-black/70 hover:border-primary/40"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-black/10 text-black/60"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
