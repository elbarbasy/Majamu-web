"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { orderTypeLabel } from "@/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { fetchCompletedOrders } from "@/services/cashier.service";
import type { CashierOrder } from "@/types";

/** Riwayat Order Selesai (CASHIER_UI.md "Riwayat Order Selesai"). */
export default function CompletedOrdersPage() {
  const [orders, setOrders] = React.useState<CashierOrder[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchCompletedOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold text-primary">Riwayat Selesai</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-card bg-black/5" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-card bg-surface py-20 text-center shadow-sm">
          <CheckCircle2 className="h-12 w-12 text-secondary" />
          <p className="text-sm font-medium text-black/55">
            Belum ada pesanan selesai.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-card bg-surface p-4 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-primary">
                    {o.displayNumber ?? "-"}
                  </p>
                  <p className="text-xs text-black/45">
                    {formatDateTime(o.createdAt)}
                  </p>
                </div>
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3" />
                  Selesai
                </Badge>
              </div>

              <p className="mt-2 line-clamp-2 text-sm text-black/60">
                {o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                <span className="text-xs text-black/50">
                  {orderTypeLabel(o.orderType)}
                </span>
                <span className="font-bold text-primary">
                  {formatCurrency(o.totalPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
