"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Download, Receipt as ReceiptIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PAYMENT_METHODS, sweetnessLabel, temperatureLabel } from "@/constants";
import { getOrderByReceipt } from "@/lib/order-cache";
import { printPdf } from "@/lib/export";
import { getPublicSettings } from "@/services/settings.service";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { OrderResult } from "@/services/orders.service";

function paymentLabel(method: string): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

/**
 * Struk Digital Premium — post-payment only.
 * Layout: Success badge (outside) → Receipt paper (logo, meja, items, total) → CTA.
 */
export default function ReceiptPage() {
  const params = useParams<{ receiptNumber: string }>();
  const receiptNumber = params?.receiptNumber;

  const [order, setOrder] = React.useState<OrderResult | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    if (receiptNumber) setOrder(getOrderByReceipt(receiptNumber));
    getPublicSettings().then((s) => setLogoUrl(s.logoUrl));
  }, [receiptNumber]);

  if (!mounted) return null;

  if (!order) {
    return (
      <div className="px-4 py-10">
        <div className="rounded-card bg-surface p-8 text-center shadow-sm">
          <ReceiptIcon className="mx-auto mb-3 h-12 w-12 text-muted" />
          <p className="text-sm text-muted">Struk tidak ditemukan di perangkat ini.</p>
        </div>
        <Link href="/" className="mt-4 block">
          <Button block variant="outline">Kembali ke Beranda</Button>
        </Link>
      </div>
    );
  }

  if (order.status === "menunggu_bayar") {
    return (
      <div className="px-4 py-10">
        <div className="rounded-card bg-[#F6F1E6] p-8 text-center">
          <ReceiptIcon className="mx-auto mb-3 h-12 w-12 text-[#E6AA2C]" />
          <h2 className="text-lg font-bold text-[#5B3E2A]">Menunggu Pembayaran</h2>
          <p className="mt-2 text-sm text-muted">
            Struk akan tersedia setelah pembayaran dikonfirmasi.
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <Link href={`/order/${order.statusUrl}`} className="block">
            <Button block>Lihat Status Pesanan</Button>
          </Link>
          <Link href="/" className="block">
            <Button block variant="outline">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
  const isDineIn = order.orderType === "dine_in";

  return (
    <div className="min-h-[100dvh] bg-[#F6F1E6]">
      <div className="mx-auto max-w-md px-4 pb-32 pt-8">

        {/* ===== 1. Success Status (OUTSIDE receipt paper) ===== */}
        <div className="mb-6 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-pill bg-[#E6AA2C]/15 px-5 py-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E6AA2C] text-[#5B3E2A]">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="text-sm font-bold text-[#5B3E2A]">Pembayaran Berhasil</span>
          </div>
          <p className="mt-2 text-xs text-[#5B3E2A]/50">
            {formatDateTime(order.createdAt)}
          </p>
        </div>

        {/* ===== 2. Receipt Paper Card ===== */}
        <div className="overflow-hidden rounded-card bg-white shadow-soft">

          {/* Logo + Tagline (inside receipt) */}
          <div className="px-6 pt-7 text-center">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Majamu"
                className="mx-auto h-10 max-w-[140px] object-contain"
              />
            ) : (
              <p className="font-display text-2xl font-semibold text-[#5B3E2A]">Majamu</p>
            )}
            <p className="mt-1.5 font-display text-sm italic text-[#5B3E2A]/60">
              Diracik Saat Itu Juga
            </p>
            {/* Gold decorative */}
            <div className="mx-auto mt-3 flex items-center justify-center gap-1">
              <span className="h-1 w-1 rounded-full bg-[#E6AA2C]" />
              <span className="h-1 w-8 rounded-full bg-[#E6AA2C]/40" />
              <span className="h-1 w-1 rounded-full bg-[#E6AA2C]" />
            </div>
          </div>

          {/* Large Table/Queue Number (inside receipt) */}
          <div className="mt-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#5B3E2A]/50">
              {isDineIn ? "MEJA" : "ANTRIAN"}
            </p>
            <p className="mt-1 font-display text-[56px] font-semibold leading-none tracking-[-0.015em] text-[#5B3E2A]">
              {isDineIn
                ? (order.displayNumber ?? "").replace(/\D/g, "") || order.displayNumber
                : order.displayNumber}
            </p>
          </div>

          {/* Divider — perforation */}
          <Perforation />

          {/* Receipt metadata */}
          <div className="space-y-3 px-6">
            <InfoLine label="No. Struk" value={order.receiptNumber} />
            <InfoLine label="Tanggal" value={formatDateTime(order.createdAt)} />
            <InfoLine label="Tipe Pesanan" value={isDineIn ? "Dine In" : "Take Away"} />
            <InfoLine label="Metode Pembayaran" value={paymentLabel(order.paymentMethod)} />
          </div>

          {/* Divider */}
          <Perforation />

          {/* Items */}
          <div className="px-6">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.06em] text-[#5B3E2A]/45">
              Item Pesanan
            </p>
            <ul className="space-y-4">
              {order.items.map((i, idx) => (
                <li key={idx}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#5B3E2A]">{i.name}</p>
                      {(i.temperature || i.sweetnessLevel) && (
                        <p className="text-xs text-[#5B3E2A]/55">
                          {[
                            i.temperature ? temperatureLabel(i.temperature) : null,
                            i.sweetnessLevel ? sweetnessLabel(i.sweetnessLevel) : null,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-[#5B3E2A]/45">
                        {i.quantity} × {formatCurrency(i.price)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular text-[#5B3E2A]">
                      {formatCurrency(i.price * i.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <Perforation />

          {/* Summary */}
          <div className="space-y-2 px-6 text-sm">
            <div className="flex justify-between text-[#5B3E2A]/55">
              <span>Total Item</span>
              <span>{totalQty} Item</span>
            </div>
            <div className="flex justify-between text-[#5B3E2A]/55">
              <span>Pembayaran</span>
              <span>{paymentLabel(order.paymentMethod)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 px-6 pb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#5B3E2A]/45">
              Total Pembayaran
            </p>
            <p className="mt-2 font-display text-[44px] font-semibold leading-none tabular tracking-[-0.015em] text-[#5B3E2A]">
              {formatCurrency(order.totalPrice)}
            </p>
          </div>
        </div>

        {/* ===== Success message (below receipt) ===== */}
        <div className="mt-6 rounded-card bg-[#E6AA2C]/10 px-5 py-4 text-center">
          <p className="text-sm text-[#5B3E2A]/70">
            Pesanan sedang diracik dan akan segera disajikan.
          </p>
        </div>

        {/* Secondary action */}
        <button
          onClick={printPdf}
          className="mt-4 w-full text-center text-sm font-medium text-[#5B3E2A]/50 underline underline-offset-2"
        >
          <Download className="mr-1 inline h-3.5 w-3.5" />
          Unduh Struk PDF
        </button>
      </div>

      {/* ===== 3. Sticky CTA ===== */}
      <div className="no-print safe-bottom fixed inset-x-0 bottom-0 bg-[#F6F1E6]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-4 py-3">
          <Link href={`/order/${order.statusUrl}`} className="block">
            <button className="flex h-14 w-full items-center justify-center rounded-btn bg-[#E6AA2C] text-base font-bold text-[#5B3E2A] shadow-soft transition active:scale-[0.99]">
              Lihat Status Pesanan
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Efek perforasi kertas struk. */
function Perforation() {
  return (
    <div className="relative my-5">
      <div className="absolute left-0 top-1/2 h-5 w-2.5 -translate-y-1/2 rounded-r-full bg-[#F6F1E6]" />
      <div className="absolute right-0 top-1/2 h-5 w-2.5 -translate-y-1/2 rounded-l-full bg-[#F6F1E6]" />
      <div className="mx-5 border-t border-dashed border-[#E8E0D0]" />
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#5B3E2A]/45">{label}</p>
      <p className="text-sm font-medium tabular text-[#5B3E2A]">{value}</p>
    </div>
  );
}
