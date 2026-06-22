"use client";

import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface OptionPillsProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Pemilih opsi berbentuk pill (dipakai untuk Tingkat Manis & Suhu). */
export function OptionPills<T extends string>({
  options,
  value,
  onChange,
}: OptionPillsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-pill border px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? "border-accent bg-accent text-accent-foreground"
                : "border-line bg-surface text-ink/70 hover:border-accent/50"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
