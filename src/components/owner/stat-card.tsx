import * as React from "react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  hint?: string;
  tone?: "primary" | "accent" | "secondary" | "warning" | "error";
}

const TONE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent",
  secondary: "bg-secondary/40 text-secondary-foreground",
  warning: "bg-warning/10 text-warning",
  error: "bg-red-100 text-red-600",
};

/** Kartu metrik dashboard Owner. */
export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "primary",
}: StatCardProps) {
  return (
    <div className="rounded-card bg-surface p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-black/55">{label}</span>
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            TONE[tone]
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-black/85">{value}</p>
      {hint && <p className="mt-1 text-xs text-black/45">{hint}</p>}
    </div>
  );
}
