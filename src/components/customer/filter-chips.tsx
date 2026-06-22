"use client";

import { FILTER_CHIPS } from "@/constants";
import { cn } from "@/lib/utils";

interface FilterChipsProps {
  active: string;
  onSelect: (chip: string) => void;
}

/**
 * Filter chips — horizontal scroll satu baris, sticky di bawah header,
 * single-select, chip aktif memakai warna primary. Props/logika tetap.
 */
export function FilterChips({ active, onSelect }: FilterChipsProps) {
  return (
    <div className="sticky top-14 z-20 bg-background/85 backdrop-blur-xl">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip === active;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onSelect(chip)}
              className={cn(
                "whitespace-nowrap rounded-pill border px-4 py-2 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-soft-sm"
                  : "border-line bg-surface text-muted hover:border-primary/40 hover:text-primary"
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
