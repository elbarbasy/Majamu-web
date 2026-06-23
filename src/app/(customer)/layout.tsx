import { AddToCartToast } from "@/components/customer/add-to-cart-toast";
import { CustomerHeader } from "@/components/customer/customer-header";
import { CustomerOverlays } from "@/components/customer/customer-overlays";
import { FloatingDock } from "@/components/customer/floating-dock";

/**
 * Shell modul Customer (mobile-first, tanpa bottom navigation).
 * Header sticky di atas, dock mengambang di bawah, overlay global.
 */
export default function CustomerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-screen-sm flex-col bg-background">
      <CustomerHeader />
      <main className="flex-1 pb-36">{children}</main>
      <FloatingDock />
      <CustomerOverlays />
      <AddToCartToast />
    </div>
  );
}
