"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Panel setengah layar dari kiri (CUSTOMER_UI.md: "Panel Setengah Layar").
 * Berisi Tentang Majamu, Kontak, Riwayat Pesanan.
 */
export function SidePanel({ open, onClose, title, children }: SidePanelProps) {
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

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 animate-fade-in bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="absolute left-0 top-0 flex h-full w-[82%] max-w-sm animate-panel-in flex-col bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
          <h2 className="text-base font-bold text-primary">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="touch-target -mr-2 flex items-center justify-center rounded-full text-black/50 hover:bg-black/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>,
    document.body
  );
}
