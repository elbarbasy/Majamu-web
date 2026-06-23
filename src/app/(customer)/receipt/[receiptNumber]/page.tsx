"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Download,
  Hash,
  MapPin,
  Receipt as ReceiptIcon,
  Sparkles,
} from "lucide-react";

import { StatusTimeline } from "@/components/customer/status-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHODS, statusLabel, sweetnessLabel, temperatureLabel } from "@/constants";
import { getOrderByReceipt } from "@/lib/order-cache";
import { printPdf } from "@/lib/export";
import { getPublicSettings } from "@/services/settings.service";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { OrderResult } from "@/services/orders.service";

function paymentLabel(method: string): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

/**
 * Struk Digital (/receipt/[receiptNumber]) — RECEIPT_SYSTEM.md.
 * Header (logo, no struk, no pesanan, tanggal, meja) -> Items -> Summary ->
 * Status -> QR Tracking -> Actions (Download PDF, Bagikan WhatsApp, Lihat Status).
 * Desain modern, mobile-first; siap dicetak (print CSS).
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

  function handleDownload() {
    printPdf();
  }

  if (!mounted) return null;

  if (!order) {
    return (
      <div className="px-4 py-10">
        <div className="rounded-card bg-surface p-8 text-center shadow-sm">
          <ReceiptIcon className="mx-auto mb-3 h-12 w-12 text-secondary" />
          <p className="text-sm text-black/60">
            Struk tidak ditemukan di perangkat ini.
          </p>
        </div>
        <Link href="/" className="mt-4 block">
          <Button block variant="outline">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    );
  }

  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
  const showCashNotice =
    order.paymentMethod === "cash" && order.status === "menunggu_bayar";

  return (
    <div className="px-4 py-4">
      {/* Peringatan pembayaran tunai */}
      {showCashNotice && (
        <div className="no-print mb-4 animate-rise-in overflow-hidden rounded-card bg-gold text-center shadow-soft">
          <div className="px-5 py-5">
            <p className="text-lg font-black tracking-wide text-[#3A2A12]">
              TUNJUKKAN KE KASIR
            </p>
            <p className="mt-1 text-sm text-[#5B3A29]">
              Silakan lakukan pembayaran di counter untuk memulai proses racik.
            </p>
            <p className="mt-3 text-3xl font-black text-primary">
              {formatCurrency(order.totalPrice)}
            </p>
          </div>
        </div>
      )}

      {/* ===== Kartu Struk (print-area) ===== */}
      <div className="print-area overflow-hidden rounded-modal bg-surface shadow-soft ring-1 ring-line">
        {/* Header */}
        <div className="relative bg-primary px-5 py-6 text-center text-primary-foreground">
          <div className="mx-auto">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo"
                className="mx-auto h-12 max-w-[120px] object-contain"
              />
            ) : (
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <Sparkles className="h-6 w-6" />
              </div>
            )}
          </div>
          <p className="mt-2 text-2xl font-extrabold tracking-tight">Majamu</p>
          <p className="text-xs opacity-80">Struk Pembelian Digital</p>
          {/* Tepi bergerigi */}
          <div className="pointer-events-none absolute -bottom-2 left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_70%,#fff_72%)] bg-[length:16px_16px]" />
        </div>

        <div className="space-y-5 p-5">
          {/* Info utama */}
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={<Hash className="h-4 w-4" />} label="No. Struk">
              {order.receiptNumber}
            </InfoRow>
            <InfoRow
              icon={<ReceiptIcon className="h-4 w-4" />}
              label="No. Pesanan"
            >
              {order.displayNumber}
            </InfoRow>
            <InfoRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Tanggal"
            >
              {formatDateTime(order.createdAt)}
            </InfoRow>
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Tipe">
              {order.orderType === "dine_in" ? "Dine In" : "Take Away"}
            </InfoRow>
          </div>

          <div className="flex justify-center">
            <Badge variant="primary">{statusLabel(order.status)}</Badge>
          </div>

          {/* Items */}
          <div className="border-t border-dashed border-black/15 pt-4">
            <ul className="space-y-3">
              {order.items.map((i) => (
                <li
                  key={`${i.productId}-${i.sweetnessLevel}-${i.temperature}`}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-semibold text-black/85">
                      {i.name}
                    </span>
                    <span className="block text-xs text-black/45">
                      {i.quantity} x {formatCurrency(i.price)}
                      {i.temperature ? ` • ${temperatureLabel(i.temperature)}` : ""}
                      {i.sweetnessLevel
                        ? ` • ${sweetnessLabel(i.sweetnessLevel)}`
                        : ""}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-black/85">
                    {formatCurrency(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <div className="space-y-1.5 border-t border-dashed border-black/15 pt-4 text-sm">
            <div className="flex justify-between text-black/60">
              <span>Total Item</span>
              <span>{totalQty} item</span>
            </div>
            <div className="flex justify-between text-black/60">
              <span>Metode Pembayaran</span>
              <span>{paymentLabel(order.paymentMethod)}</span>
            </div>
            <div className="flex items-center justify-between pt-1.5">
              <span className="text-base font-bold text-black/85">
                Total Pembayaran
              </span>
              <span className="text-xl font-extrabold text-primary">
                {formatCurrency(order.totalPrice)}
              </span>
            </div>
          </div>

          <p className="text-center text-[11px] text-black/35">
            Terima kasih telah memesan di Majamu 🌿
          </p>
        </div>
      </div>

      {/* ===== Actions (tidak ikut tercetak) ===== */}
      <div className="no-print mt-4 space-y-3">
        <Button block variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Link href={`/order/${order.statusUrl}`}>
          <Button block>Lihat Status Pesanan</Button>
        </Link>
      </div>

      {/* Ringkasan timeline status (mobile friendly, ikut tercetak) */}
      <div className="mt-4 rounded-card bg-surface p-4 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-4 text-sm font-bold text-black/80">
          Status Pesanan
        </h2>
        <StatusTimeline status={order.status} />
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card bg-background p-3">
      <span className="flex items-center gap-1.5 text-xs text-black/45">
        {icon}
        {label}
      </span>
      <span className="mt-0.5 block text-sm font-semibold text-black/85">
        {children}
      </span>
    </div>
  );
}
