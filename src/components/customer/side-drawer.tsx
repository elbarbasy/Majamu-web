"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ChevronDown,
  ClipboardList,
  Heart,
  HelpCircle,
  Home,
  Info,
  Leaf,
  Phone,
  X,
} from "lucide-react";

import { STORE_INFO } from "@/constants";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

/**
 * SideDrawer — menu samping premium. Logika lama dipertahankan
 * (ui-store infoPanelOpen/closeInfoPanel). Tidak menambah route baru:
 * item bernavigasi hanya ke route yang sudah ada; lainnya berupa
 * aksordion info / tautan eksternal.
 */
export function SideDrawer() {
  const open = useUiStore((s) => s.infoPanelOpen);
  const close = useUiStore((s) => s.closeInfoPanel);
  const [mounted, setMounted] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(null);

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

  const toggle = (k: string) => setExpanded((p) => (p === k ? null : k));

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
        className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm animate-panel-in flex-col bg-background shadow-soft-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-primary px-5 pb-5 pt-6 text-primary-foreground">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-black">
              M
            </span>
            <div>
              <p className="text-lg font-extrabold leading-none">Majamu</p>
              <p className="mt-1 text-xs text-white/80">{STORE_INFO.tagline}</p>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Section: Jamu Modern Indonesia */}
          <div className="mb-5 overflow-hidden rounded-card border border-line bg-surface shadow-soft-sm">
            <div className="flex items-center gap-3 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <Leaf className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-ink">
                  Jamu Modern Indonesia
                </p>
                <p className="clamp-2 text-xs leading-relaxed text-muted">
                  Ramuan herbal warisan nusantara, diracik higienis untuk
                  kesehatan keluarga.
                </p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-secondary" />
          </div>

          {/* Navigasi utama */}
          <nav className="space-y-1">
            <DrawerLink href="/" onClick={close} icon={<Home className="h-5 w-5" />}>
              Beranda
            </DrawerLink>
            <DrawerLink
              href="/history"
              onClick={close}
              icon={<ClipboardList className="h-5 w-5" />}
            >
              Riwayat Pesanan
            </DrawerLink>
            <DrawerButton
              icon={<Heart className="h-5 w-5" />}
              onClick={close}
              tag="Segera"
            >
              Favorit
            </DrawerButton>
          </nav>

          <div className="my-4 h-px bg-line" />

          {/* Info (aksordion, tanpa route baru) */}
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Informasi
          </p>
          <div className="space-y-1">
            <Accordion
              icon={<Info className="h-5 w-5" />}
              label="Tentang Kami"
              open={expanded === "about"}
              onToggle={() => toggle("about")}
            >
              {STORE_INFO.about}
            </Accordion>

            <a
              href={`https://wa.me/${STORE_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="flex items-center gap-3 rounded-btn px-3 py-3 text-sm font-semibold text-ink transition-colors hover:bg-primary/5"
            >
              <span className="text-primary">
                <Phone className="h-5 w-5" />
              </span>
              Kontak
            </a>

            <Accordion
              icon={<HelpCircle className="h-5 w-5" />}
              label="FAQ"
              open={expanded === "faq"}
              onToggle={() => toggle("faq")}
            >
              Pesan dengan memindai QR di meja, lalu pantau status pesanan secara
              realtime. Pembayaran tersedia tunai, QRIS, atau Midtrans.
            </Accordion>
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

function DrawerLink({
  href,
  onClick,
  icon,
  children,
}: {
  href: string;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-btn px-3 py-3 text-sm font-semibold text-ink transition-colors hover:bg-primary/5"
    >
      <span className="text-primary">{icon}</span>
      {children}
    </Link>
  );
}

function DrawerButton({
  icon,
  children,
  onClick,
  tag,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  tag?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-btn px-3 py-3 text-sm font-semibold text-ink transition-colors hover:bg-primary/5"
    >
      <span className="text-primary">{icon}</span>
      <span className="flex-1 text-left">{children}</span>
      {tag && (
        <span className="rounded-full bg-secondary/30 px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">
          {tag}
        </span>
      )}
    </button>
  );
}

function Accordion({
  icon,
  label,
  open,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-btn">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 rounded-btn px-3 py-3 text-sm font-semibold text-ink transition-colors hover:bg-primary/5"
      >
        <span className="text-primary">{icon}</span>
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <p className="px-3 pb-3 pl-11 text-xs leading-relaxed text-muted">
          {children}
        </p>
      )}
    </div>
  );
}
