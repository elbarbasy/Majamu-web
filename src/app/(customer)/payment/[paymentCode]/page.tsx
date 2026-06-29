"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Clock, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { getOrderByStatusUrl } from "@/lib/order-cache";
import { createClient } from "@/lib/supabase/client";
import { qrImageUrl } from "@/lib/qr";
import type { OrderStatus } from "@/types";

const EXPIRY_MINUTES = 15;

type PaymentState = "waiting" | "paid" | "expired";

/**
 * Halaman Pembayaran Tunai (scan QR).
 * Pelanggan tunjukkan QR ini ke kasir → kasir scan → konfirmasi.
 * Realtime: status otomatis berubah tanpa refresh.
 */
export default function CashPaymentPage() {
  const params = useParams<{ paymentCode: string }>();
  const paymentCode = params?.paymentCode ?? "";

  const [state, setState] = React.useState<PaymentState>("waiting");
  const [order, setOrder] = React.useState<{
    displayNumber: string | null;
    totalPrice: number;
    statusUrl: string;
    createdAt: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(EXPIRY_MINUTES * 60);

  // Fetch order by payment_code (Supabase + localStorage fallback)
  React.useEffect(() => {
    if (!paymentCode) return;

    // Coba dari localStorage cache dulu (pasti ada karena saveOrder di checkout)
    try {
      const raw = localStorage.getItem("majamu-orders");
      if (raw) {
        const map = JSON.parse(raw) as Record<string, unknown>;
        const cached = map[`payment:${paymentCode}`] as {
          displayNumber?: string;
          totalPrice?: number;
          statusUrl?: string;
          createdAt?: string;
          status?: string;
        } | undefined;
        if (cached) {
          setOrder({
            displayNumber: cached.displayNumber ?? null,
            totalPrice: cached.totalPrice ?? 0,
            statusUrl: cached.statusUrl ?? "",
            createdAt: cached.createdAt ?? "",
          });
          if (cached.status && cached.status !== "menunggu_bayar") {
            setState("paid");
          }
        }
      }
    } catch { /* ignore */ }

    // Juga fetch dari Supabase (untuk realtime status)
    async function fetchOrder() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("orders")
          .select("id, display_number, total_price, status_url, status, created_at")
          .eq("payment_code", paymentCode)
          .maybeSingle();

        if (!data) return;

        setOrder({
          displayNumber: data.display_number,
          totalPrice: Number(data.total_price) || 0,
          statusUrl: data.status_url,
          createdAt: data.created_at,
        });

        if (data.status !== "menunggu_bayar") {
          setState("paid");
        }
      } catch { /* Supabase belum dikonfigurasi / kolom belum ada */ }
    }
    fetchOrder();
  }, [paymentCode]);

  // Countdown timer — auto-cancel order when expired
  React.useEffect(() => {
    if (state !== "waiting") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setState("expired");
          // Call API to cancel the order in the database
          fetch("/api/scan-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentCode, action: "cancel" }),
          }).catch(() => {/* fire-and-forget */});
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state, paymentCode]);

  // Realtime: listen for status change
  React.useEffect(() => {
    if (!paymentCode || state !== "waiting") return;

    let unsub = () => {};
    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`payment-${paymentCode}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `payment_code=eq.${paymentCode}`,
          },
          (payload) => {
            const newStatus = (payload.new as { status?: string })?.status as OrderStatus;
            if (newStatus && newStatus !== "menunggu_bayar") {
              setState("paid");
            }
          }
        )
        .subscribe();
      unsub = () => supabase.removeChannel(channel);
    } catch {
      // Polling fallback
      const interval = setInterval(async () => {
        try {
          const supabase = createClient();
          const { data } = await supabase
            .from("orders")
            .select("status")
            .eq("payment_code", paymentCode)
            .maybeSingle();
          if (data && data.status !== "menunggu_bayar") setState("paid");
        } catch { /* ignore */ }
      }, 3000);
      unsub = () => clearInterval(interval);
    }
    return unsub;
  }, [paymentCode, state]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const qrData = paymentCode;
  const qrUrl = qrImageUrl(qrData, 280);

  return (
    <div className="min-h-[100dvh] bg-[#F6F1E6]">
      <div className="mx-auto max-w-md px-4 pb-8 pt-8">

        {/* Status: PAID */}
        {state === "paid" && (
          <div className="animate-fade-in text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20] text-white">
              <Check className="h-8 w-8" strokeWidth={3} />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[#1B5E20]">
              Pembayaran Berhasil
            </h1>
            <p className="mt-2 text-sm text-[#5B3E2A]/70">
              Pesanan sedang diproses. Silakan tunggu.
            </p>
            {order?.statusUrl && (
              <Link href={`/order/${order.statusUrl}`} className="mt-6 block">
                <Button block className="bg-[#1B5E20] text-white hover:bg-[#2E7D32]">
                  Lihat Status Pesanan
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Status: EXPIRED */}
        {state === "expired" && (
          <div className="animate-fade-in text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-red-700">
              Waktu Habis
            </h1>
            <p className="mt-2 text-sm text-[#5B3E2A]/70">
              Kode pembayaran sudah kadaluarsa. Silakan buat pesanan baru.
            </p>
            <Link href="/" className="mt-6 block">
              <Button block variant="outline">Kembali ke Menu</Button>
            </Link>
          </div>
        )}

        {/* Status: WAITING */}
        {state === "waiting" && (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#5B3E2A]/50">
                Payment Code
              </p>
              <p className="mt-1 text-lg font-bold tracking-wide text-[#5B3E2A]">
                {paymentCode}
              </p>
            </div>

            {/* QR Card */}
            <div className="overflow-hidden rounded-card bg-white p-6 shadow-soft">
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt="QR Payment"
                  className="h-[240px] w-[240px] rounded-2xl"
                />
              </div>

              {/* Total */}
              <div className="mt-6 text-center">
                <p className="text-xs text-[#5B3E2A]/50">Total Pembayaran</p>
                <p className="mt-1 font-display text-[40px] font-semibold leading-none tabular text-[#5B3E2A]">
                  {formatCurrency(order?.totalPrice ?? 0)}
                </p>
              </div>

              {/* Countdown */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-[#E6AA2C]" />
                <span className="font-semibold tabular text-[#5B3E2A]">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Instruction */}
            <div className="mt-6 rounded-card bg-[#E6AA2C]/10 p-4 text-center">
              <p className="text-sm font-medium text-[#5B3E2A]">
                Silakan menuju kasir dan tunjukkan QR Code ini.
              </p>
            </div>

            {/* Status badge */}
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-[#E6AA2C]/15 px-4 py-2 text-sm font-semibold text-[#5B3E2A]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#E6AA2C]" />
                Menunggu Pembayaran
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
