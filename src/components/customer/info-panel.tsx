"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronRight, ClipboardList, Info, Leaf, Phone, X } from "lucide-react";

import { AboutSheet } from "@/components/customer/about-sheet";
import { STORE_INFO } from "@/constants";
import { getPublicSettings, type PublicSettings } from "@/services/settings.service";
import { useUiStore } from "@/stores/ui-store";

/**
 * Drawer menu — slide dari KANAN.
 * Tap "Tentang Majamu" → menutup drawer, membuka AboutSheet (floating brand page).
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
  const whatsapp = settings?.whatsapp || STORE_INFO.whatsapp;

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

  if (!mounted) return null;

  // AboutSheet tetap bisa terbuka meskipun drawer tertutup.
  if (!open) {
    return <AboutSheet open={showAbout} onClose={() => setShowAbout(false)} />;
  }

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]"
            onClick={close}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-modal="true"
            className="absolute right-0 top-0 flex h-full w-[84%] max-w-sm animate-panel-in-right flex-col bg-[#5B3E2A] shadow-soft-lg"
          >
            {/* Header — bg Cream, logo + tagline di bawah logo */}
            <div className="flex items-center justify-between bg-[#F6F1E6] px-5 pb-5 pt-6">
              <div className="flex flex-col gap-1.5">
                {settings?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.logoUrl}
                    alt="Majamu"
                    className="h-10 max-w-[120px] object-contain"
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5B3E2A]/10">
                    <Leaf className="h-6 w-6 text-[#5B3E2A]" />
                  </span>
                )}
                <p className="font-display text-sm italic text-[#5B3E2A]">
                  {tagline}
                </p>
              </div>
              <button
                onClick={close}
                aria-label="Tutup"
                className="touch-target flex items-center justify-center rounded-full text-[#5B3E2A] hover:bg-[#5B3E2A]/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body — bg Mocca Brown */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                <Link
                  href="/history"
                  onClick={close}
                  className="flex items-center gap-3 rounded-card border border-[#F6F1E6]/20 bg-[#F6F1E6]/10 px-4 py-3.5 text-sm font-semibold text-[#F6F1E6] transition active:scale-[0.99]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6F1E6]/15 text-[#F6F1E6]">
                    <ClipboardList className="h-5 w-5" />
                  </span>
                  <span className="flex-1">Riwayat Pesanan</span>
                  <ChevronRight className="h-4 w-4 text-[#F6F1E6]/60" />
                </Link>

                <button
                  onClick={() => {
                    close();
                    setShowAbout(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-card border border-[#F6F1E6]/20 bg-[#F6F1E6]/10 px-4 py-3.5 text-left text-sm font-semibold text-[#F6F1E6] transition active:scale-[0.99]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6F1E6]/15 text-[#F6F1E6]">
                    <Info className="h-5 w-5" />
                  </span>
                  <span className="flex-1">Tentang Majamu</span>
                  <ChevronRight className="h-4 w-4 text-[#F6F1E6]/60" />
                </button>

                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="flex items-center gap-3 rounded-card border border-[#F6F1E6]/20 bg-[#F6F1E6]/10 px-4 py-3.5 text-sm font-semibold text-[#F6F1E6] transition active:scale-[0.99]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6F1E6]/15 text-[#F6F1E6]">
                    <Phone className="h-5 w-5" />
                  </span>
                  <span className="flex-1">Kontak Kami</span>
                  <ChevronRight className="h-4 w-4 text-[#F6F1E6]/60" />
                </a>
              </nav>

              {/* Mini section herbal */}
              <div className="mt-6 overflow-hidden rounded-card border border-[#F6F1E6]/20 bg-[#F6F1E6]/10">
                <div className="flex items-center gap-3 p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F6F1E6]/15 text-[#F6F1E6]">
                    <Leaf className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#F6F1E6]">
                      Jamu Modern Indonesia
                    </p>
                    <p className="clamp-2 text-xs leading-relaxed text-[#F6F1E6]/70">
                      Ramuan herbal warisan nusantara untuk kesehatan keluarga.
                    </p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gradient-to-r from-[#E6AA2C] via-[#7E9F6E] to-[#F6F1E6]" />
              </div>
            </div>

            <div className="safe-bottom border-t border-[#F6F1E6]/20 p-4 text-center text-[11px] text-[#F6F1E6]/60">
              Majamu • Jamu Modern Indonesia
            </div>
          </aside>
        </div>,
        document.body
      )}
      <AboutSheet open={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}
