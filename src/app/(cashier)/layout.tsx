import { CashierTopbar } from "@/components/cashier/cashier-topbar";
import { CashierToaster } from "@/components/cashier/cashier-toaster";
import { AudioUnlocker } from "@/components/cashier/audio-unlocker";

/**
 * Shell modul Kasir (CASHIER_UI.md): Tablet Landscape First, satu papan kerja
 * untuk kasir & peracik. Top bar + area kartu order. Lebar penuh (bukan POS
 * tradisional dengan sidebar/keypad).
 */
export default function CashierLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-[100dvh] bg-background">
      <CashierTopbar />
      <main className="mx-auto w-full max-w-screen-2xl">{children}</main>
      <CashierToaster />
      <AudioUnlocker />
    </div>
  );
}
