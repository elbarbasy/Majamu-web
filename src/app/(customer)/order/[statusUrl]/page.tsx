"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, ReceiptText } from "lucide-react";

import { StatusTimeline } from "@/components/customer/status-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STORE_INFO, statusLabel, sweetnessLabel, temperatureLabel } from "@/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getOrderByStatusUrl, updateCachedStatus } from "@/lib/order-cache";
import { getOrderStatusByUrl } from "@/services/orders.service";
import { useActiveOrderStore } from "@/stores/active-order-store";
import { useCustomerHistoryStore } from "@/stores/customer-history-store";
import type { OrderResult } from "@/services/orders.service";

/**
 * Tracking Pesanan (/order/[statusUrl]) — timeline status (aturan wajib).
 */
export default function OrderTrackingPage() {
  const params = useParams<{ statusUrl: string }>();
  const router = useRouter();
  const statusUrl = params?.statusUrl;

  const updateActiveStatus = useActiveOrderStore((s) => s.updateStatus);
  const updateHistoryStatus = useCustomerHistoryStore((s) => s.updateStatus);

  const [order, setOrder] = React.useState<OrderResult | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (!statusUrl) return;
    const cached = getOrderByStatusUrl(statusUrl);
    setOrder(cached);

    // Coba ambil status terbaru dari Supabase (jika tersedia).
    getOrderStatusByUrl(statusUrl).then((live) => {
      if (!live) return;
      updateCachedStatus(statusUrl, live.status);
      setOrder((prev) => (prev ? { ...prev, status: live.status } : prev));
      updateActiveStatus(live.status);
      if (cached?.orderId) updateHistoryStatus(cached.orderId, live.status);
    });
  }, [statusUrl, updateActiveStatus, updateHistoryStatus]);

  if (!mounted) return null;

  return (
    <div className="px-4 py-3">
      {/* Sub-header */}
      <div className="-mx-1 mb-2 flex items-center gap-2">
        <button
          onClick={() => router.push("/")}
          aria-label="Kembali"
          className="touch-target flex items-center justify-center rounded-full text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-primary">Status Pesanan</h1>
      </div>

      {!order ? (
        <div className="rounded-card bg-surface p-6 text-center text-sm text-black/60 shadow-sm">
          Pesanan tidak ditemukan di perangkat ini.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Ringkasan */}
          <div className="rounded-card bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-black/50">Nomor Pesanan</p>
                <p className="font-display text-lead font-semibold text-primary">
                  {order.displayNumber}
                </p>
              </div>
              <Badge variant="primary">{statusLabel(order.status)}</Badge>
            </div>
            <p className="mt-2 text-xs text-black/45">
              {formatDateTime(order.createdAt)}
            </p>
            {order.status !== "selesai" && order.status !== "menunggu_bayar" && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-accent/12 px-3 py-1 text-xs font-semibold text-accent">
                Estimasi 10–15 menit
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-card bg-surface p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-black/80">
              Perkembangan Pesanan
            </h2>
            <StatusTimeline status={order.status} />
          </div>

          {/* Daftar item */}
          <div className="rounded-card bg-surface p-4 shadow-sm">
            <ul className="space-y-2">
              {order.items.map((i) => (
                <li
                  key={`${i.productId}-${i.sweetnessLevel}-${i.temperature}`}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <span className="min-w-0 text-black/70">
                    <span className="font-medium">
                      {i.quantity}x {i.name}
                    </span>
                    {(i.temperature || i.sweetnessLevel) && (
                      <span className="block text-xs text-muted">
                        {[
                          i.temperature ? temperatureLabel(i.temperature) : null,
                          i.sweetnessLevel ? sweetnessLabel(i.sweetnessLevel) : null,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-medium text-black/80">
                    {formatCurrency(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
              <span className="text-sm text-black/60">Total</span>
              <span className="text-base font-extrabold text-primary">
                {formatCurrency(order.totalPrice)}
              </span>
            </div>
          </div>

          {order.receiptNumber && (
            <Link href={`/receipt/${order.receiptNumber}`}>
              <Button block variant="outline">
                <ReceiptText className="h-4 w-4" />
                Lihat Struk
              </Button>
            </Link>
          )}

          <a
            href={`https://wa.me/${STORE_INFO.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button block variant="ghost">
              <MessageCircle className="h-4 w-4" />
              Hubungi via WhatsApp
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}
