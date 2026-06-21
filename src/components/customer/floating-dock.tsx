"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { ActiveOrderBadge } from "@/components/customer/active-order-badge";
import { FloatingCartBar } from "@/components/customer/floating-cart-bar";

/**
 * Dock mengambang di bawah (fixed) berisi Badge Pesanan Aktif + Floating Cart Bar.
 * Disembunyikan pada halaman keranjang/checkout untuk menghindari tumpang tindih.
 */
export function FloatingDock() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const hidden =
    pathname.startsWith("/cart") || pathname.startsWith("/checkout");
  if (hidden) return null;

  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-30">
      <div className="safe-bottom pointer-events-auto mx-auto flex max-w-screen-sm flex-col gap-2 px-4 pb-3">
        <ActiveOrderBadge />
        <FloatingCartBar />
      </div>
    </div>
  );
}
