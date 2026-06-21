"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

/** Modal dialog terpusat (desktop-first) untuk form Owner. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  size = "md",
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const width =
    size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-md";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[90dvh] w-full ${width} animate-fade-in flex-col overflow-hidden rounded-modal bg-surface shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-black/5 p-5">
          <div>
            {title && (
              <h2 className="text-lg font-bold text-primary">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-black/55">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="touch-target -mr-2 -mt-2 flex items-center justify-center rounded-full text-black/50 hover:bg-black/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-black/5 p-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
