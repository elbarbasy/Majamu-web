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
 * Drawer menu — full-height, slide dari KIRI, radius pada sisi kanan.
 * Layout flex column: header + navigasi di atas, info brand selalu di bawah.
 * Tutup via: klik overlay, tombol X, tombol ESC, atau swipe ke kiri (mobile).
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

  // Swipe ke kiri untuk menutup (mobile).
  const touchStartX = React.useRef<number | null>(null);
  const touchDX = React.useRef(0);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDX.current = 0;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    touchDX.current = e.touches[0].clientX - touchStartX.current;
  }
  function onTouchEnd() {
    if (touchDX.current < -60) close(); // geser kiri > 60px → tutup
    touchStartX.current = null;
    touchDX.current = 0;
  }

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
            className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[8px]"
            onClick={close}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-modal="true"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="absolute inset-y-0 left-0 flex w-[84%] max-w-sm animate-panel-in-left flex-col overflow-hidden rounded-r-[28px] bg-[#5B3E2A] shadow-soft-lg"
          >
            {/* ===== TOP: Header + Navigation ===== */}
            <div className="flex flex-col">
              {/* Header — bg Cream, logo + tagline di bawah logo, padding 24px */}
              <div className="flex items-start justify-between bg-[#F6F1E6] p-6">
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
                  className="touch-target -mr-1 flex items-center justify-center rounded-full text-[#5B3E2A] hover:bg-[#5B3E2A]/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation — tepat di bawah header */}
              <nav className="space-y-3 p-5">
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
            </div>

            {/* ===== BOTTOM: Brand info (selalu di bawah) ===== */}
            <div className="mt-auto px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-6">
              <div className="h-px w-full bg-[#F6F1E6]/15" />
              <div className="mt-5 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F6F1E6]/15 text-[#F6F1E6]">
                  <Leaf className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[#F6F1E6]">
                    Jamu Modern Indonesia
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#F6F1E6]/70">
                    Ramuan herbal warisan nusantara untuk gaya hidup modern.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[11px] font-medium text-[#F6F1E6]/50">
                © 2026 Majamu
              </p>
            </div>
          </aside>
        </div>,
        document.body
      )}
      <AboutSheet open={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}
