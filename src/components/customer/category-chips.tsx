"use client";

import { FILTER_CHIPS } from "@/constants";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  active: string;
  onSelect: (chip: string) => void;
}

/**
 * Kategori — horizontal scroll satu baris (no wrap), chip modern,
 * active state jelas. Tidak terpotong (padding kiri/kanan + scroll halus).
 * Props & logika filter tetap (active/onSelect).
 */
export function CategoryChips({ active, onSelect }: CategoryChipsProps) {
  return (
    <div className="sticky top-[6.5rem] z-20 bg-background/85 backdrop-blur-xl">
      <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-4 py-3">
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip === active;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onSelect(chip)}
              className={cn(
                "snap-start whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all",
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
