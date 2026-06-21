"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, MapPin, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHODS, statusLabel, sweetnessLabel } from "@/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getOrderByReceipt } from "@/lib/order-cache";
import type { OrderResult } from "@/services/orders.service";

function paymentLabel(method: string): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

/**
 * Struk Digital (/receipt/[receiptNumber]) — RECEIPT_SYSTEM.md / WIREFRAMES.md.
 * Header (logo, no struk, no pesanan, tanggal, meja), Items, Summary, Status,
 * Actions (Download PDF, Bagikan WhatsApp, Lihat Status Pesanan).
 */
export default function ReceiptPage() {
  const params = useParams<{ receiptNumber: string }>();
  const receiptNumber = params?.receiptNumber;

  const [order, setOrder] = React.useState<OrderResult | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (receiptNumber) setOrder(getOrderByReceipt(receiptNumber));
  }, [receiptNumber]);

  function handleDownload() {
    window.print();
  }

  function handleShare() {
    if (!order) return;
    const lines = [
      `Halo${order.customerName ? " " + order.customerName : ""},`,
      "",
      "Pesanan Anda berhasil dibuat.",
      `No Order: ${order.displayNumber}`,
      `No Struk: ${order.receiptNumber}`,
      `Total: ${formatCurrency(order.totalPrice)}`,
      "",
      `Status Pesanan: ${typeof window !== "undefined" ? window.location.origin : ""}/order/${order.statusUrl}`,
    ];
    const text = encodeURIComponent(lines.join("\n"));
    const phone = (order.whatsapp || "").replace(/[^0-9]/g, "");
    const url = phone
      ? `https://wa.me/${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  }

  if (!mounted) return null;

  if (!order) {
    return (
      <div className="px-4 py-8">
        <div className="rounded-card bg-surface p-6 text-center text-sm text-black/60 shadow-sm">
          Struk tidak ditemukan di perangkat ini.
        </div>
        <Link href="/" className="mt-4 block">
          <Button block variant="outline">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="overflow-hidden rounded-card bg-surface shadow-sm">
        {/* Header */}
        <div className="bg-primary px-5 py-5 text-center text-primary-foreground">
          <p className="text-xl font-extrabold tracking-tight">Majamu</p>
          <p className="mt-1 text-xs opacity-80">Struk Pembelian Digital</p>
        </div>

        <div className="space-y-4 p-5">
          {/* Info */}
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-black/50">No. Struk</span>
            <span className="text-right font-semibold text-black/85">
              {order.receiptNumber}
            </span>
            <span className="text-black/50">No. Pesanan</span>
            <span className="text-right font-semibold text-black/85">
              {order.displayNumber}
            </span>
            <span className="text-black/50">Tanggal</span>
            <span className="text-right text-black/80">
              {formatDateTime(order.createdAt)}
            </span>
            <span className="text-black/50">Tipe</span>
            <span className="flex items-center justify-end gap-1 text-right text-black/80">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {order.orderType === "dine_in" ? "Dine In" : "Take Away"}
            </span>
          </div>

          <div className="flex justify-center">
            <Badge variant="primary">{statusLabel(order.status)}</Badge>
          </div>

          {/* Items */}
          <div className="border-t border-dashed border-black/15 pt-4">
            <ul className="space-y-3">
              {order.items.map((i) => (
                <li
                  key={`${i.productId}-${i.sweetnessLevel}`}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-black/85">{i.name}</span>
                    <span className="block text-xs text-black/45">
                      {i.quantity} x {formatCurrency(i.price)} •{" "}
                      {sweetnessLabel(i.sweetnessLevel)}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium text-black/85">
                    {formatCurrency(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <div className="space-y-1 border-t border-dashed border-black/15 pt-4 text-sm">
            <div className="flex justify-between text-black/60">
              <span>Total Item</span>
              <span>
                {order.items.reduce((s, i) => s + i.quantity, 0)} item
              </span>
            </div>
            <div className="flex justify-between text-black/60">
              <span>Metode Pembayaran</span>
              <span>{paymentLabel(order.paymentMethod)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-base font-bold text-black/85">
                Total Pembayaran
              </span>
              <span className="text-base font-extrabold text-primary">
                {formatCurrency(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-2 print:hidden">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="accent" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Bagikan WA
          </Button>
        </div>
        <Link href={`/order/${order.statusUrl}`}>
          <Button block>Lihat Status Pesanan</Button>
        </Link>
      </div>
    </div>
  );
}
