"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Camera, Check, Keyboard, Loader2, X, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface ScanPaymentModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "input" | "loading" | "found" | "not_found" | "success" | "error";

interface OrderInfo {
  id: string;
  displayNumber: string | null;
  customerName: string | null;
  totalPrice: number;
  status: string;
  items: { name: string; quantity: number; price: number }[];
}

/**
 * Modal scan pembayaran kasir — input payment code (manual atau scan).
 * Lookup → tampilkan detail → Terima Pembayaran → sukses.
 */
export function ScanPaymentModal({ open, onClose }: ScanPaymentModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [step, setStep] = React.useState<Step>("input");
  const [code, setCode] = React.useState("");
  const [order, setOrder] = React.useState<OrderInfo | null>(null);
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (open) { setStep("input"); setCode(""); setOrder(null); }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function lookup(paymentCode: string) {
    if (!paymentCode.trim()) return;
    setStep("loading");
    try {
      const res = await fetch("/api/scan-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentCode: paymentCode.trim(), action: "lookup" }),
      });
      if (!res.ok) { setStep("not_found"); return; }
      const data = await res.json();
      if (!data.found) { setStep("not_found"); return; }
      setOrder(data.order);
      setStep("found");
    } catch {
      setStep("not_found");
    }
  }

  async function confirm() {
    if (!order) return;
    setStep("loading");
    try {
      const res = await fetch("/api/scan-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentCode: code.trim(), action: "confirm" }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("success");
      } else if (data.error === "already_confirmed") {
        setErrorMsg("Pesanan ini sudah dikonfirmasi sebelumnya.");
        setStep("error");
      } else {
        setErrorMsg("Gagal mengkonfirmasi. Coba lagi.");
        setStep("error");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
      setStep("error");
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B5E20]/30 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md animate-pop-in overflow-hidden rounded-[20px] bg-white shadow-soft-lg">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black/60 hover:bg-black/10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step: Input */}
        {step === "input" && (
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1B5E20]/10 text-[#1B5E20]">
                <Camera className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#5B3E2A]">Scan Pembayaran</h2>
                <p className="text-xs text-muted">Masukkan kode pembayaran pelanggan</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-input border border-line px-3">
                <Keyboard className="h-4 w-4 text-muted" />
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="MJM-20260625-000123"
                  autoFocus
                  className="h-12 w-full bg-transparent text-base font-medium outline-none"
                  onKeyDown={(e) => e.key === "Enter" && lookup(code)}
                />
              </div>
              <Button onClick={() => lookup(code)} className="h-12 bg-[#1B5E20] hover:bg-[#2E7D32]">
                Cari
              </Button>
            </div>

            <p className="mt-3 text-center text-xs text-muted">
              Minta pelanggan tunjukkan QR atau bacakan kode pembayaran
            </p>
          </div>
        )}

        {/* Step: Loading */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-10 w-10 animate-spin text-[#1B5E20]" />
            <p className="mt-3 text-sm text-muted">Mencari pesanan...</p>
          </div>
        )}

        {/* Step: Not Found */}
        {step === "not_found" && (
          <div className="p-6 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-3 text-lg font-bold text-[#5B3E2A]">Tidak Ditemukan</h3>
            <p className="mt-1 text-sm text-muted">Kode pembayaran tidak ditemukan di sistem.</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" block onClick={() => setStep("input")}>
                Scan Lagi
              </Button>
              <Button block onClick={() => setStep("input")} className="bg-[#1B5E20] hover:bg-[#2E7D32]">
                Masukkan Kode Manual
              </Button>
            </div>
          </div>
        )}

        {/* Step: Found — Detail pesanan */}
        {step === "found" && order && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-[#5B3E2A]">Detail Pesanan</h3>
            <div className="mt-4 space-y-3">
              <InfoRow label="Nomor Pesanan" value={order.displayNumber ?? "-"} />
              <InfoRow label="Nama Pelanggan" value={order.customerName ?? "-"} />
              <InfoRow label="Metode" value="Tunai" />
              <InfoRow label="Status" value="Menunggu Pembayaran" />
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <p className="mb-2 text-xs font-semibold uppercase text-muted">Daftar Menu</p>
              <ul className="space-y-1">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="tabular font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm font-bold text-[#5B3E2A]">Total</span>
              <span className="text-xl font-bold tabular text-[#5B3E2A]">
                {formatCurrency(order.totalPrice)}
              </span>
            </div>

            <Button
              block
              size="lg"
              onClick={confirm}
              className="mt-6 bg-[#1B5E20] text-lg hover:bg-[#2E7D32]"
            >
              <Check className="h-5 w-5" />
              Terima Pembayaran
            </Button>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20] text-white">
              <Check className="h-8 w-8" strokeWidth={3} />
            </div>
            <h3 className="mt-4 text-xl font-bold text-[#1B5E20]">Pembayaran Diterima</h3>
            <p className="mt-1 text-sm text-muted">Pesanan langsung masuk proses racik.</p>
            <Button block onClick={onClose} className="mt-6 bg-[#1B5E20] hover:bg-[#2E7D32]">
              Selesai
            </Button>
          </div>
        )}

        {/* Step: Error */}
        {step === "error" && (
          <div className="p-6 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-3 text-lg font-bold text-[#5B3E2A]">{errorMsg}</h3>
            <Button block variant="outline" onClick={() => setStep("input")} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-[#5B3E2A]">{value}</span>
    </div>
  );
}
