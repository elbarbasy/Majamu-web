"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  GalleryHorizontalEnd,
  LayoutDashboard,
  Leaf,
  Coffee,
  QrCode,
  Settings,
  SlidersHorizontal,
  Users,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getPublicSettings } from "@/services/settings.service";

export const OWNER_NAV = [
  { href: "/owner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/reports", label: "Laporan", icon: BarChart3 },
  { href: "/owner/cash", label: "Kas", icon: Wallet },
  { href: "/owner/products", label: "Produk", icon: Coffee },
  { href: "/owner/filter-chips", label: "Filter Quiz", icon: SlidersHorizontal },
  { href: "/owner/ingredients", label: "Ingredients", icon: Leaf },
  { href: "/owner/banners", label: "Banner", icon: GalleryHorizontalEnd },
  { href: "/owner/tables", label: "QR Meja", icon: QrCode },
  { href: "/owner/cashiers", label: "Kasir", icon: Users },
  { href: "/owner/settings", label: "Pengaturan", icon: Settings },
];

export function OwnerSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    getPublicSettings().then((s) => setLogoUrl(s.logoUrl));
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-5">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Majamu" className="h-8 max-w-[100px] object-contain" />
        ) : (
          <span className="text-xl font-extrabold tracking-tight text-primary">
            Majamu
          </span>
        )}
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          Owner
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {OWNER_NAV.map((item) => {
          const active =
            item.href === "/owner"
              ? pathname === "/owner"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-black/65 hover:bg-primary/10"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-black/5 p-4 text-xs text-black/40">
        UMKM Jamu • Majamu POS
      </div>
    </div>
  );
}
