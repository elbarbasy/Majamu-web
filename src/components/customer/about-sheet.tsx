"use client";

import * as React from "react";
import { Leaf, Mortar, Shield, X } from "lucide-react";
import { createPortal } from "react-dom";

import { getPublicSettings, type PublicSettings } from "@/services/settings.service";
import { STORE_INFO } from "@/constants";

interface AboutSheetProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Tentang Majamu — premium floating brand page (fullscreen bottom sheet).
 * Membaca brand story dari settings (dinamis). Desain Apple-style storytelling.
 */
export function AboutSheet({ open, onClose }: AboutSheetProps) {
  const [mounted, setMounted] = React.useState(false);
  const [settings, setSettings] = React.useState<PublicSettings | null>(null);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (open) getPublicSettings().then(setSettings);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const logoUrl = settings?.logoUrl;
  const brandStory = settings?.brandStory || STORE_INFO.about;
  const tagline = settings?.tagline || STORE_INFO.tagline;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in bg-[#5B3E2A]/40 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
      />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 top-4 animate-sheet-in overflow-hidden rounded-t-[28px] bg-[#F6F1E6] shadow-soft-lg"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#5B3E2A]/10 text-[#5B3E2A] transition hover:bg-[#5B3E2A]/20"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="h-full overflow-y-auto pb-28">
          {/* ===== Hero ===== */}
          <div className="px-6 pb-8 pt-12 text-center">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Majamu"
                className="mx-auto h-12 max-w-[160px] object-contain"
              />
            ) : (
              <p className="font-display text-[34px] font-semibold tracking-[-0.01em] text-[#5B3E2A]">
                Majamu
              </p>
            )}
            <p className="mt-3 font-display text-base italic text-[#5B3E2A]/70">
              {tagline}
            </p>
            {/* Gold accent */}
            <div className="mx-auto mt-4 flex items-center justify-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[#E6AA2C]" />
              <span className="h-1 w-10 rounded-full bg-[#E6AA2C]/40" />
              <span className="h-1 w-1 rounded-full bg-[#E6AA2C]" />
            </div>
          </div>

          {/* ===== Brand Story Card ===== */}
          <div className="mx-4 rounded-card bg-white p-6 shadow-soft-sm">
            <h2 className="font-display text-[23px] font-medium tracking-[-0.01em] text-[#5B3E2A]">
              Tentang Majamu
            </h2>
            <p className="mt-4 text-base leading-[1.7] text-[#5B3E2A]/80">
              {brandStory}
            </p>
          </div>

          {/* ===== Value Proposition ===== */}
          <div className="mt-8 px-4">
            <h3 className="text-center font-display text-[19px] font-medium text-[#5B3E2A]">
              Jamu Modern Indonesia
            </h3>
            <p className="mt-1 text-center text-sm text-[#5B3E2A]/60">
              Ramuan herbal warisan nusantara untuk gaya hidup modern.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <ValueCard
                icon={<Leaf className="h-6 w-6" />}
                title="Bahan Alami Pilihan"
              />
              <ValueCard
                icon={<Mortar className="h-6 w-6" />}
                title="Diracik Saat Itu Juga"
              />
              <ValueCard
                icon={<Shield className="h-6 w-6" />}
                title="Tanpa Pengawet"
              />
            </div>
          </div>

          {/* ===== Philosophy / Quote ===== */}
          <div className="mx-4 mt-8 rounded-card border border-[#E6AA2C]/30 bg-[#E6AA2C]/8 p-6 text-center">
            <h3 className="font-display text-[19px] font-medium text-[#5B3E2A]">
              Mengapa Majamu?
            </h3>
            <p className="mt-4 text-sm leading-[1.7] text-[#5B3E2A]/75">
              Kami percaya kesehatan harus hadir dalam rutinitas sehari-hari,
              bukan hanya saat seseorang sakit.
            </p>
            <p className="mt-3 text-sm leading-[1.7] text-[#5B3E2A]/75">
              Majamu hadir untuk membuat konsumsi jamu menjadi lebih praktis,
              modern, dan menyenangkan.
            </p>
          </div>

          {/* ===== Closing ===== */}
          <div className="mt-10 pb-4 text-center">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Majamu"
                className="mx-auto h-8 max-w-[100px] object-contain opacity-70"
              />
            ) : (
              <p className="font-display text-lg font-medium text-[#5B3E2A]/60">
                Majamu
              </p>
            )}
            <p className="mt-2 font-display text-sm italic text-[#5B3E2A]/50">
              {tagline}
            </p>
            <div className="mx-auto mt-3 flex items-center justify-center gap-1">
              <span className="h-0.5 w-0.5 rounded-full bg-[#E6AA2C]/60" />
              <span className="h-0.5 w-6 rounded-full bg-[#E6AA2C]/30" />
              <span className="h-0.5 w-0.5 rounded-full bg-[#E6AA2C]/60" />
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="safe-bottom absolute inset-x-0 bottom-0 bg-[#F6F1E6]/90 backdrop-blur-sm">
          <div className="px-4 py-3">
            <button
              onClick={onClose}
              className="flex h-14 w-full items-center justify-center rounded-btn bg-[#5B3E2A] text-base font-bold text-[#F6F1E6] shadow-soft transition active:scale-[0.99]"
            >
              Lihat Menu Jamu
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ValueCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card bg-white p-4 shadow-soft-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6AA2C]/12 text-[#5B3E2A]">
        {icon}
      </span>
      <p className="text-center text-xs font-semibold leading-tight text-[#5B3E2A]">
        {title}
      </p>
    </div>
  );
}
