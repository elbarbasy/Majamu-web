"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Camera, Check, Keyboard, Loader2, ScanLine, X, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface ScanPaymentModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "choose" | "camera" | "manual" | "loading" | "found" | "not_found" | "success" | "error";

interface OrderInfo {
  id: string;
  displayNumber: string | null;
  customerName: string | null;
  totalPrice: number;
  status: string;
  items: { name: string; quantity: number; price: number }[];
}

/**
 * Modal scan pembayaran kasir:
 * 1. Pilih: Buka Kamera atau Masukkan Kode Manual
 * 2. Kamera: scan QR via BarcodeDetector / fallback manual
 * 3. Manual: input teks
 * 4. Lookup → detail → Terima Pembayaran → sukses
 */
export function ScanPaymentModal({ open, onClose }: ScanPaymentModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [step, setStep] = React.useState<Step>("choose");
  const [code, setCode] = React.useState("");
  const [order, setOrder] = React.useState<OrderInfo | null>(null);
  const [errorMsg, setErrorMsg] = React.useState("");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (open) { setStep("choose"); setCode(""); setOrder(null); setErrorMsg(""); }
    if (!open) stopCamera();
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function startCamera() {
    setStep("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        startScanning();
      }
    } catch {
      // Kamera gagal → fallback manual
      setStep("manual");
    }
  }

  function startScanning() {
    // Coba BarcodeDetector (Chrome/Edge/Android built-in)
    const win = window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> } };
    if (!win.BarcodeDetector) {
      // Browser tidak support → fallback manual setelah 2 detik
      setTimeout(() => {
        if (step === "camera") setStep("manual");
      }, 2000);
      return;
    }

    const detector = new win.BarcodeDetector({ formats: ["qr_code"] });
    let active = true;

    async function scan() {
      if (!active || !videoRef.current) return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const value = barcodes[0].rawValue;
          if (value) {
            active = false;
            stopCamera();
            setCode(value);
            await lookup(value);
            return;
          }
        }
      } catch { /* ignore */ }
      if (active) requestAnimationFrame(scan);
    }
    requestAnimationFrame(scan);

    // Cleanup saat step berubah
    return () => { active = false; };
  }

  async function lookup(paymentCode: string) {
    const trimmed = paymentCode.trim();
    if (!trimmed) return;
    setCode(trimmed);
    setStep("loading");
    try {
      const res = await fetch("/api/scan-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentCode: trimmed, action: "lookup" }),
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
        // Beritahu board kasir agar segera refresh (tanpa menunggu realtime).
        try {
          window.dispatchEvent(new CustomEvent("majamu:orders-refresh"));
        } catch { /* ignore */ }
        setStep("success");
      } else if (data.error === "already_confirmed") {
        setErrorMsg("Pesanan ini sudah dikonfirmasi sebelumnya.");
        setStep("error");
      } else if (data.error === "update_failed") {
        setErrorMsg(`Gagal menyimpan ke database: ${data.detail ?? "coba lagi"}`);
        setStep("error");
      } else if (data.error === "server_not_configured") {
        setErrorMsg("Server Supabase belum dikonfigurasi (SERVICE_ROLE_KEY).");
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

  function handleClose() {
    stopCamera();
    onClose();
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B5E20]/30 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md animate-pop-in overflow-hidden rounded-[20px] bg-white shadow-soft-lg">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black/60 hover:bg-black/10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step: Choose */}
        {step === "choose" && (
          <div className="p-6">
            <div className="mb-5 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1B5E20]/10 text-[#1B5E20]">
                <ScanLine className="h-7 w-7" />
              </span>
              <h2 className="mt-3 text-lg font-bold text-[#5B3E2A]">Scan Pembayaran</h2>
              <p className="text-sm text-muted">Pilih cara menerima pembayaran</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center gap-4 rounded-card border border-line p-4 text-left transition hover:border-[#1B5E20]/40 hover:bg-[#1B5E20]/5 active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1B5E20]/10 text-[#1B5E20]">
                  <Camera className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-bold text-[#5B3E2A]">Buka Kamera</p>
                  <p className="text-xs text-muted">Scan QR code pelanggan</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStep("manual")}
                className="flex items-center gap-4 rounded-card border border-line p-4 text-left transition hover:border-[#1B5E20]/40 hover:bg-[#1B5E20]/5 active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E6AA2C]/15 text-[#E6AA2C]">
                  <Keyboard className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-bold text-[#5B3E2A]">Masukkan Kode Manual</p>
                  <p className="text-xs text-muted">Ketik payment code pelanggan</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step: Camera */}
        {step === "camera" && (
          <div className="p-4">
            <p className="mb-3 text-center text-sm font-semibold text-[#5B3E2A]">
              Arahkan kamera ke QR pelanggan
            </p>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                muted
              />
              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 rounded-2xl border-2 border-white/60" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => { stopCamera(); setStep("manual"); }}
              className="mt-3 w-full text-center text-sm font-medium text-[#5B3E2A] underline"
            >
              Masukkan kode manual
            </button>
          </div>
        )}

        {/* Step: Manual */}
        {step === "manual" && (
          <div className="p-6">
            <h3 className="mb-4 text-lg font-bold text-[#5B3E2A]">Masukkan Kode Pembayaran</h3>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="MJM-20260625-000123"
                autoFocus
                className="h-12 flex-1 rounded-input border border-line px-4 text-base font-medium outline-none focus:border-[#1B5E20]"
                onKeyDown={(e) => e.key === "Enter" && lookup(code)}
              />
              <button
                type="button"
                onClick={() => lookup(code)}
                className="h-12 shrink-0 rounded-btn bg-[#1B5E20] px-5 font-bold text-white transition hover:bg-[#2E7D32] active:scale-95"
              >
                Cari
              </button>
            </div>
            <button
              type="button"
              onClick={() => setStep("choose")}
              className="mt-3 w-full text-center text-sm font-medium text-muted underline"
            >
              Kembali
            </button>
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
            <p className="mt-1 text-sm text-muted">Kode pembayaran tidak ditemukan.</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button block onClick={() => setStep("choose")} className="bg-[#1B5E20] hover:bg-[#2E7D32]">
                Scan Lagi
              </Button>
              <Button block variant="outline" onClick={() => setStep("manual")}>
                Masukkan Kode Manual
              </Button>
            </div>
          </div>
        )}

        {/* Step: Found */}
        {step === "found" && order && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-[#5B3E2A]">Detail Pesanan</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Nomor Pesanan</span><span className="font-medium text-[#5B3E2A]">{order.displayNumber ?? "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted">Nama Pelanggan</span><span className="font-medium text-[#5B3E2A]">{order.customerName ?? "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted">Metode</span><span className="font-medium text-[#5B3E2A]">Tunai</span></div>
              <div className="flex justify-between"><span className="text-muted">Status</span><span className="font-semibold text-[#E6AA2C]">Menunggu Pembayaran</span></div>
            </div>

            <div className="mt-4 border-t border-line pt-3">
              <p className="mb-2 text-xs font-semibold uppercase text-muted">Daftar Menu</p>
              <ul className="space-y-1.5">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-[#5B3E2A]">{item.quantity}x {item.name}</span>
                    <span className="tabular font-medium text-[#5B3E2A]">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <span className="font-bold text-[#5B3E2A]">Total</span>
              <span className="text-xl font-bold tabular text-[#5B3E2A]">{formatCurrency(order.totalPrice)}</span>
            </div>

            <button
              type="button"
              onClick={confirm}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-btn bg-[#1B5E20] text-base font-bold text-white shadow-soft transition hover:bg-[#2E7D32] active:scale-[0.99]"
            >
              <Check className="h-5 w-5" />
              Terima Pembayaran
            </button>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20] text-white">
              <Check className="h-8 w-8" strokeWidth={3} />
            </div>
            <h3 className="mt-4 text-xl font-bold text-[#1B5E20]">Pembayaran Diterima!</h3>
            <p className="mt-1 text-sm text-muted">Pesanan masuk ke daftar &ldquo;Diterima&rdquo;. Tekan &ldquo;Mulai Racik&rdquo; untuk memproses.</p>
            <Button block onClick={handleClose} className="mt-6 bg-[#1B5E20] hover:bg-[#2E7D32]">
              Selesai
            </Button>
          </div>
        )}

        {/* Step: Error */}
        {step === "error" && (
          <div className="p-6 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-3 text-lg font-bold text-[#5B3E2A]">{errorMsg}</h3>
            <Button block variant="outline" onClick={() => setStep("choose")} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
