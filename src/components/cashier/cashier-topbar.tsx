"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  LayoutGrid,
  PackageX,
  ScrollText,
  Volume2,
  VolumeX,
  Wallet,
} from "lucide-react";

import { StockSheet } from "@/components/cashier/stock-sheet";
import { ScanPaymentModal } from "@/components/cashier/scan-payment-modal";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getPublicSettings } from "@/services/settings.service";
import {
  useCashierSettingsStore,
  type Volume,
} from "@/stores/cashier-settings-store";

const NAV = [
  { href: "/pos", label: "Order Board", icon: LayoutGrid },
  { href: "/pos/completed", label: "Riwayat Selesai", icon: ScrollText },
  { href: "/pos/shift", label: "Catatan Shift", icon: Wallet },
];

const VOLUMES: { value: Volume; label: string }[] = [
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
];

function CashierLogo() {
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    getPublicSettings().then((s) => setLogoUrl(s.logoUrl));
  }, []);
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={logoUrl}
        alt="Majamu"
        className="h-7 max-w-[80px] object-contain sm:h-8 sm:max-w-[110px]"
      />
    );
  }
  return (
    <span className="text-base font-extrabold tracking-tight text-primary sm:text-lg">
      Majamu
    </span>
  );
}

/**
 * Top bar kasir: navigasi board/riwayat/shift + toggle Stok Habis +
 * pengaturan suara pesanan baru (ON/OFF & volume).
 */
export function CashierTopbar() {
  const pathname = usePathname();
  const [stockOpen, setStockOpen] = React.useState(false);
  const [scanOpen, setScanOpen] = React.useState(false);
  const [soundOpen, setSoundOpen] = React.useState(false);

  const soundEnabled = useCashierSettingsStore((s) => s.soundEnabled);
  const volume = useCashierSettingsStore((s) => s.volume);
  const setSoundEnabled = useCashierSettingsStore((s) => s.setSoundEnabled);
  const setVolume = useCashierSettingsStore((s) => s.setVolume);

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-surface/95 backdrop-blur">
      <div className="flex h-16 items-center gap-2 px-3 sm:px-4">
        {/* Brand (kiri, tidak menyusut) */}
        <div className="flex shrink-0 items-center gap-2">
          <CashierLogo />
          <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary sm:inline">
            Kasir
          </span>
        </div>

        {/* Aksi (kanan, bisa di-scroll horizontal bila sempit) */}
        <nav className="no-scrollbar ml-auto flex items-center gap-1.5 overflow-x-auto">
          {NAV.map((item) => {
            const active =
              item.href === "/pos"
                ? pathname === "/pos"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex h-10 shrink-0 items-center justify-center gap-2 rounded-btn px-2.5 text-sm font-semibold transition-colors lg:px-3",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-black/60 hover:bg-primary/10"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setScanOpen(true)}
            title="Scan Pembayaran"
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-btn bg-[#1B5E20] px-2.5 text-sm font-bold text-white shadow-soft-sm hover:bg-[#2E7D32] lg:px-4"
          >
            <Camera className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Scan Pembayaran</span>
          </button>

          <button
            type="button"
            onClick={() => setStockOpen(true)}
            title="Stok Habis"
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-btn border border-black/15 px-2.5 text-sm font-semibold text-black/70 hover:border-primary/40 lg:px-3"
          >
            <PackageX className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Stok Habis</span>
          </button>

          {/* Pengaturan suara */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setSoundOpen((v) => !v)}
              aria-label="Pengaturan suara"
              title="Pengaturan suara"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-btn border transition-colors",
                soundEnabled
                  ? "border-primary/30 text-primary"
                  : "border-black/15 text-black/40"
              )}
            >
              {soundEnabled ? (
                <Volume2 className="h-[18px] w-[18px]" />
              ) : (
                <VolumeX className="h-[18px] w-[18px]" />
              )}
            </button>

            {soundOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setSoundOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 top-12 z-40 w-60 animate-rise-in rounded-card border border-line bg-surface p-4 shadow-soft-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink">
                      Suara Pesanan Baru
                    </span>
                    <Switch
                      checked={soundEnabled}
                      onChange={setSoundEnabled}
                    />
                  </div>
                  <p className="mb-3 mt-1 text-xs text-muted">
                    Hanya berbunyi saat ada pesanan baru.
                  </p>
                  <p className="mb-2 text-xs font-semibold text-black/70">
                    Volume
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {VOLUMES.map((v) => (
                      <button
                        key={v.value}
                        type="button"
                        disabled={!soundEnabled}
                        onClick={() => setVolume(v.value)}
                        className={cn(
                          "rounded-btn border px-2 py-2 text-xs font-semibold transition-colors disabled:opacity-40",
                          volume === v.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-black/15 text-black/60"
                        )}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>

      <StockSheet open={stockOpen} onClose={() => setStockOpen(false)} />
      <ScanPaymentModal open={scanOpen} onClose={() => setScanOpen(false)} />
    </header>
  );
}
