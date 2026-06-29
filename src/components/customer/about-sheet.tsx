"use client";

import * as React from "react";
import { FlaskConical, Leaf, Shield, X } from "lucide-react";
import { createPortal } from "react-dom";

import { getPublicSettings, type PublicSettings } from "@/services/settings.service";
import { STORE_INFO } from "@/constants";

interface AboutSheetProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Tentang Majamu — premium floating centered modal.
 * Membaca brand story dari settings (dinamis). Header (logo+tagline) tetap
 * di atas, hanya body yang scroll. Animasi masuk/keluar slide-up + fade 280ms.
 */
export function AboutSheet({ open, onClose }: AboutSheetProps) {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [settings, setSettings] = React.useState<PublicSettings | null>(null);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (open) getPublicSettings().then(setSettings);
  }, [open]);

  // Mount/unmount dengan animasi keluar (reverse) ~280ms.
  React.useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const t = setTimeout(() => setVisible(false), 280);
      return () => clearTimeout(t);
    }
  }, [open, visible]);

  React.useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [visible, onClose]);

  if (!mounted || !visible) return null;

  const logoUrl = settings?.logoUrl;
  const brandStory = settings?.brandStory || STORE_INFO.about;
  const tagline = settings?.tagline || STORE_INFO.tagline;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-5">
      {/* Backdrop: hitam 40% + blur 8px */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[8px] ${
          closing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Floating modal */}
      <div
        role="dialog"
        aria-modal="true"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
        className={`relative flex max-h-[calc(100dvh-32px)] w-full max-w-[420px] flex-col overflow-hidden rounded-[30px] border border-white/35 bg-[#F6F1E6] ${
          closing ? "animate-modal-out" : "animate-modal-in"
        }`}
      >
        {/* Close button — 48x48, kanan atas */}
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/65 text-[#5B3E2A] transition-colors duration-200 hover:bg-white/90 active:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ===== Header (tetap di atas) ===== */}
        <div className="shrink-0 px-6 pb-6 pt-10 text-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Majamu"
              className="mx-auto h-11 max-w-[150px] object-contain"
            />
          ) : (
            <p className="font-display text-[30px] font-semibold tracking-[-0.01em] text-[#5B3E2A]">
              Majamu
            </p>
          )}
          <p className="mt-2.5 font-display text-base italic text-[#5B3E2A]/70">
            {tagline}
          </p>
          {/* Gold accent */}
          <div className="mx-auto mt-3.5 flex items-center justify-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-[#E6AA2C]" />
            <span className="h-1 w-10 rounded-full bg-[#E6AA2C]/40" />
            <span className="h-1 w-1 rounded-full bg-[#E6AA2C]" />
          </div>
        </div>

        {/* ===== Body (hanya bagian ini yang scroll) ===== */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {/* Brand Story Card */}
          <div className="rounded-card bg-white p-6 shadow-soft-sm">
            <h2 className="font-display text-[23px] font-medium tracking-[-0.01em] text-[#5B3E2A]">
              Tentang Majamu
            </h2>
            <p className="mt-4 text-base font-medium leading-[1.7] text-[#5B3E2A]/80">
              {brandStory}
            </p>
          </div>

          {/* Value Proposition */}
          <div className="mt-8">
            <h3 className="text-center font-display text-[19px] font-medium text-[#5B3E2A]">
              Jamu Modern Indonesia
            </h3>
            <p className="mt-1 text-center text-sm font-medium text-[#5B3E2A]/60">
              Ramuan herbal warisan nusantara untuk gaya hidup modern.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <ValueCard
                icon={<Leaf className="h-6 w-6" />}
                title="Bahan Alami Pilihan"
              />
              <ValueCard
                icon={<FlaskConical className="h-6 w-6" />}
                title="Diracik Saat Itu Juga"
              />
              <ValueCard
                icon={<Shield className="h-6 w-6" />}
                title="Tanpa Pengawet"
              />
            </div>
          </div>

          {/* Philosophy / Quote */}
          <div className="mt-8 rounded-card border border-[#E6AA2C]/30 bg-[#E6AA2C]/8 p-6 text-center">
            <h3 className="font-display text-[19px] font-medium text-[#5B3E2A]">
              Mengapa Majamu?
            </h3>
            <p className="mt-4 text-sm font-medium leading-[1.7] text-[#5B3E2A]/75">
              Kami percaya kesehatan harus hadir dalam rutinitas sehari-hari,
              bukan hanya saat seseorang sakit.
            </p>
            <p className="mt-3 text-sm font-medium leading-[1.7] text-[#5B3E2A]/75">
              Majamu hadir untuk membuat konsumsi jamu menjadi lebih praktis,
              modern, dan menyenangkan.
            </p>
          </div>

          {/* Closing */}
          <div className="mt-10 text-center">
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
