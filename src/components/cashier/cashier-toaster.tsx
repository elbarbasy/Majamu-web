"use client";

import { Bell, CheckCircle2, Info, Undo2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useToastStore } from "@/stores/toast-store";

/** Penampil toast Cashier (status update + order baru). Fixed di atas-tengah. */
export function CashierToaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon =
          t.tone === "success"
            ? CheckCircle2
            : t.tone === "new"
              ? Bell
              : Info;
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-md animate-rise-in items-start gap-3 rounded-card border bg-surface px-4 py-3 shadow-soft-lg",
              t.tone === "success" && "border-green-300",
              t.tone === "new" && "border-amber-300",
              (!t.tone || t.tone === "info") && "border-line"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                t.tone === "success" && "bg-green-100 text-green-700",
                t.tone === "new" && "bg-amber-100 text-amber-700",
                (!t.tone || t.tone === "info") && "bg-black/5 text-black/60"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
              {t.title && (
                <p className="text-sm font-bold text-ink">{t.title}</p>
              )}
              <p className="whitespace-pre-line text-sm text-black/70">
                {t.message}
              </p>
            </div>

            {t.action && (
              <button
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-btn bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                <Undo2 className="h-3.5 w-3.5" />
                {t.action.label}
              </button>
            )}

            <button
              onClick={() => dismiss(t.id)}
              aria-label="Tutup"
              className="shrink-0 text-black/30 hover:text-black/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
