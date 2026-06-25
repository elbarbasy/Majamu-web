"use client";

import * as React from "react";
import Link from "next/link";
import {
  Coffee,
  PackageX,
  Receipt,
  Store,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/owner/page-header";
import { SectionCard } from "@/components/owner/section-card";
import { StatCard } from "@/components/owner/stat-card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils";
import {
  getDashboard,
  updateStoreSettings,
  type DashboardSummary,
} from "@/services/owner.service";

export default function OwnerDashboardPage() {
  const [data, setData] = React.useState<DashboardSummary | null>(null);

  React.useEffect(() => {
    getDashboard().then(setData);
  }, []);

  async function toggleStore(open: boolean) {
    const status = open ? "open" : "closed";
    setData((d) => (d ? { ...d, storeStatus: status } : d));
    await updateStoreSettings({ storeStatus: status });
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Ringkasan operasional warung jamu hari ini."
      />

      {/* Status Toko */}
      <SectionCard className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-black/80">Status Toko</p>
              <p className="text-xs text-black/50">
                {data?.storeStatus === "open"
                  ? "Toko sedang buka — menerima pesanan"
                  : "Toko tutup — pesanan dinonaktifkan"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={data?.storeStatus === "open" ? "success" : "neutral"}>
              {data?.storeStatus === "open" ? "Buka" : "Tutup"}
            </Badge>
            <Switch
              checked={data?.storeStatus === "open"}
              onChange={toggleStore}
              label="Toggle status toko"
            />
          </div>
        </div>
      </SectionCard>

      {/* Metrik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Omzet Hari Ini"
          value={formatCurrency(data?.omzetToday ?? 0)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="Pesanan Hari Ini"
          value={data?.ordersToday ?? 0}
          icon={<Receipt className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Pesanan Aktif"
          value={data?.activeOrders ?? 0}
          icon={<Coffee className="h-5 w-5" />}
          hint="Sedang diproses kasir"
          tone="secondary"
        />
        <StatCard
          label="Dibatalkan"
          value={data?.cancelledToday ?? 0}
          icon={<XCircle className="h-5 w-5" />}
          hint="Pesanan dibatalkan hari ini"
          tone="error"
        />
        <StatCard
          label="Kasir Aktif"
          value={data?.activeCashiers ?? 0}
          icon={<Users className="h-5 w-5" />}
          tone="primary"
        />
      </div>

      {/* Produk terlaris + stok habis */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Produk Terlaris Hari Ini">
          {data?.topProduct ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Coffee className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-black/85">
                    {data.topProduct.name}
                  </p>
                  <p className="text-xs text-black/50">
                    {data.topProduct.qty} terjual hari ini
                  </p>
                </div>
              </div>
              <Badge variant="accent">#1</Badge>
            </div>
          ) : (
            <p className="text-sm text-black/50">Belum ada penjualan.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Produk Stok Habis Hari Ini"
          action={
            <Link
              href="/owner/products"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Kelola
            </Link>
          }
        >
          {data && data.outOfStock.length > 0 ? (
            <ul className="space-y-2">
              {data.outOfStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 text-sm text-black/75"
                >
                  <PackageX className="h-4 w-4 text-error" />
                  {p.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-black/50">Semua produk tersedia.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
