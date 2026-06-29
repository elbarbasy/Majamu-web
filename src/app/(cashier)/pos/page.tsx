"use client";

import * as React from "react";
import { Inbox } from "lucide-react";

import { OrderCard } from "@/components/cashier/order-card";
import { StatusTabs } from "@/components/cashier/status-tabs";
import { useNow } from "@/hooks/use-now";
import { formatCurrency } from "@/lib/utils";
import { playNewOrderSound } from "@/lib/sound";
import {
  fetchActiveOrders,
  subscribeOrders,
  updateOrderStatus,
} from "@/services/cashier.service";
import { useCashierBoardStore } from "@/stores/cashier-board-store";
import { useCashierSettingsStore } from "@/stores/cashier-settings-store";
import { useToastStore } from "@/stores/toast-store";
import type { CashierOrder, OrderStatus } from "@/types";

type TabValue = OrderStatus | "all";

const HIGHLIGHT_MS = 30000;

/**
 * Order Board Kasir — realtime, warna status fungsional, notifikasi order baru
 * (suara + toast + highlight 30 dtk), dan Undo 10 dtk pada perubahan status.
 */
export default function PosBoardPage() {
  const orders = useCashierBoardStore((s) => s.orders);
  const loading = useCashierBoardStore((s) => s.loading);
  const setOrders = useCashierBoardStore((s) => s.setOrders);
  const moveStatus = useCashierBoardStore((s) => s.moveStatus);
  const restoreOrder = useCashierBoardStore((s) => s.restoreOrder);

  const push = useToastStore((s) => s.push);

  const now = useNow(1000);
  const [activeTab, setActiveTab] = React.useState<TabValue>("all");

  const knownIds = React.useRef<Set<string>>(new Set());
  const newAt = React.useRef<Record<string, number>>({});
  const initialized = React.useRef(false);

  // Muat awal + langganan realtime + deteksi order baru.
  React.useEffect(() => {
    let alive = true;

    function notifyNew(newOrders: CashierOrder[]) {
      const { soundEnabled, volume } = useCashierSettingsStore.getState();
      if (soundEnabled) playNewOrderSound(volume); // sekali, audio fallback bila diblokir
      if (newOrders.length === 1) {
        const o = newOrders[0];
        const qty = o.items.reduce((s, i) => s + i.quantity, 0);
        push({
          tone: "new",
          title: "🔔 Pesanan Baru",
          message: `${o.displayNumber ?? "-"}\n${qty} Item • ${formatCurrency(o.totalPrice)}`,
          durationMs: 6000,
        });
      } else {
        push({
          tone: "new",
          title: "🔔 Pesanan Baru",
          message: `${newOrders.length} pesanan baru masuk`,
          durationMs: 6000,
        });
      }
    }

    /** Notifikasi untuk order QRIS yang baru saja dikonfirmasi otomatis oleh webhook. */
    function notifyQrisConfirmed(confirmedOrders: CashierOrder[]) {
      const { soundEnabled, volume } = useCashierSettingsStore.getState();
      if (soundEnabled) playNewOrderSound(volume);
      if (confirmedOrders.length === 1) {
        const o = confirmedOrders[0];
        const qty = o.items.reduce((s, i) => s + i.quantity, 0);
        push({
          tone: "new",
          title: "✅ QRIS Terbayar",
          message: `${o.displayNumber ?? "-"}\n${qty} Item • ${formatCurrency(o.totalPrice)}`,
          durationMs: 6000,
        });
      } else {
        push({
          tone: "new",
          title: "✅ QRIS Terbayar",
          message: `${confirmedOrders.length} pesanan QRIS terkonfirmasi`,
          durationMs: 6000,
        });
      }
    }

    async function load() {
      const data = await fetchActiveOrders();
      if (!alive) return;

      const incomingNew = data.filter((o) => !knownIds.current.has(o.id));
      if (initialized.current && incomingNew.length > 0) {
        const ts = Date.now();
        incomingNew.forEach((o) => (newAt.current[o.id] = ts));
        notifyNew(incomingNew);
      }

      // Deteksi order QRIS yang baru saja otomatis dikonfirmasi (menunggu_bayar → diterima via webhook).
      // Order ini sudah dikenal (ada di knownIds) tapi statusnya berubah ke "diterima" secara otomatis.
      if (initialized.current) {
        const prevOrders = useCashierBoardStore.getState().orders;
        const qrisAutoConfirmed = data.filter((o) => {
          if (o.status !== "diterima") return false;
          if (o.paymentMethod !== "qris" && o.paymentMethod !== "midtrans") return false;
          const prev = prevOrders.find((p) => p.id === o.id);
          return prev && prev.status === "menunggu_bayar";
        });
        if (qrisAutoConfirmed.length > 0) {
          const ts = Date.now();
          qrisAutoConfirmed.forEach((o) => (newAt.current[o.id] = ts));
          notifyQrisConfirmed(qrisAutoConfirmed);
        }
      }

      knownIds.current = new Set(data.map((o) => o.id));
      initialized.current = true;
      setOrders(data);
    }

    load();
    const unsub = subscribeOrders(load);

    // Refresh segera setelah kasir konfirmasi pembayaran (scan modal),
    // tanpa bergantung pada Realtime.
    const onManualRefresh = () => load();
    window.addEventListener("majamu:orders-refresh", onManualRefresh);

    // Jaring pengaman: polling berkala agar board tetap sinkron meskipun
    // Supabase Realtime belum diaktifkan.
    const poll = setInterval(load, 8000);

    return () => {
      alive = false;
      unsub();
      window.removeEventListener("majamu:orders-refresh", onManualRefresh);
      clearInterval(poll);
    };
  }, [setOrders, push]);

  const counts = React.useMemo(() => {
    const base: Record<TabValue, number> = {
      all: orders.length,
      menunggu_bayar: 0,
      diterima: 0,
      diracik: 0,
      siap_diambil: 0,
      selesai: 0,
      dibatalkan: 0,
    };
    orders.forEach((o) => {
      base[o.status] = (base[o.status] ?? 0) + 1;
    });
    return base;
  }, [orders]);

  const visible = React.useMemo(
    () =>
      activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab),
    [orders, activeTab]
  );

  async function handleAdvance(order: CashierOrder, next: OrderStatus) {
    const prevStatus = order.status;
    moveStatus(order.id, next); // optimistik
    await updateOrderStatus(order.id, next);

    // Kirim struk WA saat kasir konfirmasi bayar TUNAI (menunggu_bayar → diterima)
    if (prevStatus === "menunggu_bayar" && next === "diterima" && order.whatsapp) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            whatsapp: order.whatsapp,
            customerName: order.customerName ?? "",
            orderNumber: order.displayNumber ?? "",
            receiptNumber: order.receiptNumber ?? "",
            total: formatCurrency(order.totalPrice),
            receiptUrl: `${appUrl}/receipt/${order.receiptNumber ?? order.statusUrl}`,
            statusUrl: `${appUrl}/order/${order.statusUrl}`,
          }),
        }).catch(() => {});
      } catch {
        /* fire-and-forget */
      }
    }

    push({
      tone: "success",
      message: "Status berhasil diperbarui",
      durationMs: 10000,
      action: {
        label: "Undo",
        onClick: async () => {
          if (next === "selesai") {
            restoreOrder({ ...order, status: prevStatus });
          } else {
            moveStatus(order.id, prevStatus);
          }
          await updateOrderStatus(order.id, prevStatus);
        },
      },
    });
  }

  return (
    <div>
      <StatusTabs active={activeTab} counts={counts} onSelect={setActiveTab} />

      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-card bg-black/5" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-card bg-surface py-20 text-center shadow-sm">
            <Inbox className="h-12 w-12 text-secondary" />
            <p className="text-sm font-medium text-black/55">
              Tidak ada pesanan pada status ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.map((order) => {
              const firstSeen = newAt.current[order.id];
              const isNew = Boolean(firstSeen && now - firstSeen < HIGHLIGHT_MS);
              return (
                <OrderCard
                  key={order.id}
                  order={order}
                  now={now}
                  isNew={isNew}
                  onAdvance={handleAdvance}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
