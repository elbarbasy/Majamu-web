"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  /** Full-screen bottom sheet (dipakai untuk Quiz, CUSTOMER_UI.md). */
  fullScreen?: boolean;
  /** Konten footer sticky (mis. tombol aksi). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Sembunyikan tombol close bawaan. */
  hideClose?: boolean;
}

/**
 * Bottom sheet mobile-first dengan portal + backdrop.
 * Dipakai untuk Detail Produk (default) dan Quiz (fullScreen).
 */
export function BottomSheet({
  open,
  onClose,
  title,
  fullScreen = false,
  footer,
  children,
  hideClose = false,
}: BottomSheetProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative flex w-full animate-sheet-in flex-col bg-surface shadow-2xl",
          fullScreen
            ? "h-[100dvh] rounded-none"
            : "max-h-[88dvh] rounded-t-modal"
        )}
      >
        {/* Handle / header */}
        <div className="shrink-0 px-4 pt-3">
          {!fullScreen && (
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/15" />
          )}
          {(title || !hideClose) && (
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-base font-bold text-primary">{title}</h2>
              {!hideClose && (
                <button
                  onClick={onClose}
                  aria-label="Tutup"
                  className="touch-target -mr-2 flex items-center justify-center rounded-full text-black/50 hover:bg-black/5"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Body (scrollable) */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>

        {/* Sticky footer */}
        {footer && (
          <div className="safe-bottom shrink-0 border-t border-black/5 bg-surface px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
