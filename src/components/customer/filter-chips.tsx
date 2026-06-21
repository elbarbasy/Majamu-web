"use client";

import { FILTER_CHIPS } from "@/constants";
import { cn } from "@/lib/utils";

interface FilterChipsProps {
  active: string;
  onSelect: (chip: string) => void;
}

/**
 * Filter Chips (CUSTOMER_UI.md / DESIGN_SYSTEM.md):
 * - Single Row, Horizontal Scroll, No Wrap, Sticky on Scroll.
 * Tidak boleh wrap ke baris kedua: pakai flex-nowrap + overflow-x-auto.
 */
export function FilterChips({ active, onSelect }: FilterChipsProps) {
  return (
    <div className="sticky top-14 z-20 bg-background/95 backdrop-blur">
      <div className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto px-4 py-3">
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip === active;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onSelect(chip)}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-black/10 bg-surface text-black/70 hover:border-primary/40"
              )}
            >
              {chip}
            </button>
          );
        })}
      </div>
    </div>
  );
}
