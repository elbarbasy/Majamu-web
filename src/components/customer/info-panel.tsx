"use client";

import Link from "next/link";
import { ClipboardList, Info, Phone } from "lucide-react";

import { SidePanel } from "@/components/ui/side-panel";
import { STORE_INFO } from "@/constants";
import { useUiStore } from "@/stores/ui-store";

/**
 * Panel Setengah Layar (icon kiri logo) — CUSTOMER_UI.md:
 * Tentang Majamu, Kontak, Riwayat Pesanan. Bukan navigasi utama.
 */
export function InfoPanel() {
  const open = useUiStore((s) => s.infoPanelOpen);
  const close = useUiStore((s) => s.closeInfoPanel);

  return (
    <SidePanel open={open} onClose={close} title="Majamu">
      <p className="mb-6 text-sm text-black/60">{STORE_INFO.tagline}</p>

      <nav className="flex flex-col gap-1">
        <Link
          href="/history"
          onClick={close}
          className="flex items-center gap-3 rounded-card px-3 py-3 text-sm font-medium text-black/80 hover:bg-primary/5"
        >
          <ClipboardList className="h-5 w-5 text-primary" />
          Riwayat Pesanan
        </Link>

        <div className="rounded-card px-3 py-3">
          <div className="mb-1 flex items-center gap-3 text-sm font-semibold text-black/80">
            <Info className="h-5 w-5 text-primary" />
            Tentang Majamu
          </div>
          <p className="pl-8 text-sm text-black/60">{STORE_INFO.about}</p>
        </div>

        <a
          href={`https://wa.me/${STORE_INFO.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-card px-3 py-3 text-sm font-medium text-black/80 hover:bg-primary/5"
        >
          <Phone className="h-5 w-5 text-primary" />
          Kontak
        </a>
      </nav>
    </SidePanel>
  );
}
