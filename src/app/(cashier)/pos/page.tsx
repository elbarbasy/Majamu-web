"use client";

import * as React from "react";
import { Inbox } from "lucide-react";

import { NewOrderToast } from "@/components/cashier/new-order-toast";
import { OrderCard } from "@/components/cashier/order-card";
import { StatusTabs } from "@/components/cashier/status-tabs";
import { useNow } from "@/hooks/use-now";
import {
  fetchActiveOrders,
  subscribeOrders,
  updateOrderStatus,
} from "@/services/cashier.service";
import { useCashierBoardStore } from "@/stores/cashier-board-store";
import type { OrderStatus } from "@/types";

type TabValue = OrderStatus | "all";

/**
 * Order Board Kasir (CASHIER_UI.md): Realtime, kartu besar, timer per order,
 * tab status. Grid responsif: 1 kolom (mobile) / 2 (tablet) / 3-4 (desktop).
 */
export default function PosBoardPage() {
  const orders = useCashierBoardStore((s) => s.orders);
  const loading = useCashierBoardStore((s) => s.loading);
  const setOrders = useCashierBoardStore((s) => s.setOrders);
  const moveStatus = useCashierBoardStore((s) => s.moveStatus);

  const now = useNow(1000);
  const [activeTab, setActiveTab] = React.useState<TabValue>("all");
  const [toast, setToast] = React.useState(false);
  const prevCount = React.useRef(0);

  // Muat awal + langganan realtime.
  React.useEffect(() => {
    let alive = true;
    async function load() {
      const data = await fetchActiveOrders();
      if (alive) setOrders(data);
    }
    load();
    const unsub = subscribeOrders(load);
    return () => {
      alive = false;
      unsub();
    };
  }, [setOrders]);

  // Notifikasi order baru ketika jumlah bertambah.
  React.useEffect(() => {
    if (orders.length > prevCount.current && prevCount.current !== 0) {
      setToast(true);
      const t = setTimeout(() => setToast(false), 3000);
      return () => clearTimeout(t);
    }
    prevCount.current = orders.length;
  }, [orders.length]);

  const counts = React.useMemo(() => {
    const base: Record<TabValue, number> = {
      all: orders.length,
      menunggu_bayar: 0,
      diterima: 0,
      diracik: 0,
      siap_diambil: 0,
      selesai: 0,
    };
    orders.forEach((o) => {
      base[o.status] = (base[o.status] ?? 0) + 1;
    });
    return base;
  }, [orders]);

  const visible = React.useMemo(
    () => (activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab)),
    [orders, activeTab]
  );

  async function handleAdvance(orderId: string, next: OrderStatus) {
    moveStatus(orderId, next); // optimistik
    await updateOrderStatus(orderId, next);
  }

  return (
    <div>
      <NewOrderToast show={toast} />

      <StatusTabs active={activeTab} counts={counts} onSelect={setActiveTab} />

      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-card bg-black/5"
              />
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
            {visible.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                now={now}
                onAdvance={handleAdvance}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
