"use client";

import { SWEETNESS_LEVELS } from "@/constants";
import { cn } from "@/lib/utils";
import type { SweetnessLevel } from "@/types";

interface SweetnessSelectorProps {
  value: SweetnessLevel;
  onChange: (value: SweetnessLevel) => void;
}

/** Pemilih Tingkat Manis (CUSTOMER_UI.md / WIREFRAMES.md). */
export function SweetnessSelector({ value, onChange }: SweetnessSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SWEETNESS_LEVELS.map((s) => {
        const active = s.value === value;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            className={cn(
              "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-black/15 bg-surface text-black/70 hover:border-primary/40"
            )}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
