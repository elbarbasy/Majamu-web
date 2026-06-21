"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  size?: "sm" | "md";
}

/** Kontrol jumlah (CUSTOMER_UI.md: Kontrol Jumlah). */
export function QuantityControl({
  value,
  onChange,
  min = 1,
  size = "md",
}: QuantityControlProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        aria-label="Kurangi"
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn(
          "flex items-center justify-center rounded-full border border-primary/30 text-primary disabled:opacity-40",
          dim
        )}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-base font-bold tabular-nums text-primary">
        {value}
      </span>
      <button
        type="button"
        aria-label="Tambah"
        onClick={() => onChange(value + 1)}
        className={cn(
          "flex items-center justify-center rounded-full bg-primary text-primary-foreground",
          dim
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
