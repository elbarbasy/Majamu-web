"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronRight, ClipboardList, Info, Leaf, Phone, X } from "lucide-react";

import { STORE_INFO } from "@/constants";
import { getPublicSettings, type PublicSettings } from "@/services/settings.service";
import { useUiStore } from "@/stores/ui-store";

/**
 * Drawer menu — slide dari KANAN, animasi halus.
 * Isi: Tentang Majamu (dari settings.brand_story — TIDAK hardcoded),
 * Kontak Kami, Riwayat Pesanan.
 */
export function InfoPanel() {
  const open = useUiStore((s) => s.infoPanelOpen);
  const close = useUiStore((s) => s.closeInfoPanel);
  const [mounted, setMounted] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);
  const [settings, setSettings] = React.useState<PublicSettings | null>(null);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (open) getPublicSettings().then(setSettings);
  }, [open]);

  const tagline = settings?.tagline || STORE_INFO.tagline;
  const brandStory = settings?.brandStory || STORE_INFO.about;
  const whatsapp = settings?.whatsapp || STORE_INFO.whatsapp;

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]"
        onClick={close}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 flex h-full w-[84%] max-w-sm animate-panel-in-right flex-col bg-background shadow-soft-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-primary px-5 pb-5 pt-6 text-primary-foreground">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <Leaf className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-extrabold leading-none tracking-wide">
                MAJAMU
              </p>
              <p className="mt-1 text-xs text-white/80">{tagline}</p>
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Tutup"
            className="touch-target flex items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            <Link
              href="/history"
              onClick={close}
              className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 text-sm font-semibold text-ink shadow-soft-sm transition active:scale-[0.99]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" />
              </span>
              <span className="flex-1">Riwayat Pesanan</span>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>

            <button
              onClick={() => setShowAbout((v) => !v)}
              className="flex w-full items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 text-left text-sm font-semibold text-ink shadow-soft-sm transition active:scale-[0.99]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Info className="h-5 w-5" />
              </span>
              <span className="flex-1">Tentang Majamu</span>
              <ChevronRight
                className={`h-4 w-4 text-muted transition-transform ${showAbout ? "rotate-90" : ""}`}
              />
            </button>
            {showAbout && (
              <p className="rounded-card bg-surface px-4 py-3 text-xs leading-relaxed text-muted">
                {brandStory}
              </p>
            )}

            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 text-sm font-semibold text-ink shadow-soft-sm transition active:scale-[0.99]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/30 text-secondary-foreground">
                <Phone className="h-5 w-5" />
              </span>
              <span className="flex-1">Kontak Kami</span>
              <ChevronRight className="h-4 w-4 text-muted" />
            </a>
          </nav>

          {/* Mini section herbal */}
          <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface shadow-soft-sm">
            <div className="flex items-center gap-3 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <Leaf className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-ink">
                  Jamu Modern Indonesia
                </p>
                <p className="clamp-2 text-xs leading-relaxed text-muted">
                  Ramuan herbal warisan nusantara untuk kesehatan keluarga.
                </p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-secondary" />
          </div>
        </div>

        <div className="safe-bottom border-t border-line p-4 text-center text-[11px] text-muted">
          Majamu • Jamu Modern Indonesia
        </div>
      </aside>
    </div>,
    document.body
  );
}
