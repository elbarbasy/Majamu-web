"use client";

import * as React from "react";
import { Download, FileText, Receipt, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/owner/page-header";
import { SectionCard } from "@/components/owner/section-card";
import { StatCard } from "@/components/owner/stat-card";
import { Button } from "@/components/ui/button";
import { downloadCsv, printPdf } from "@/lib/export";
import { cn, formatCurrency } from "@/lib/utils";
import {
  getReport,
  type ReportData,
  type ReportRange,
} from "@/services/owner.service";

const RANGES: { value: ReportRange; label: string }[] = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
];

export default function ReportsPage() {
  const [range, setRange] = React.useState<ReportRange>("daily");
  const [data, setData] = React.useState<ReportData | null>(null);

  React.useEffect(() => {
    getReport(range).then(setData);
  }, [range]);

  function exportExcel() {
    if (!data) return;
    const rows: (string | number)[][] = [
      ["Laporan Penjualan", RANGES.find((r) => r.value === range)?.label ?? ""],
      [],
      ["Total Penjualan", data.totalSales],
      ["Jumlah Pesanan", data.orderCount],
      [],
      ["Produk Terlaris", "Qty", "Total"],
      ...data.topProducts.map((p) => [p.name, p.qty, p.total]),
      [],
      ["Metode Pembayaran", "Total"],
      ...data.byPayment.map((p) => [p.method, p.total]),
    ];
    downloadCsv(`laporan-${range}.csv`, rows);
  }

  const maxSeries = data?.series?.length
    ? Math.max(1, ...data.series.map((s) => s.total))
    : 1;

  return (
    <div>
      <PageHeader
        title="Laporan Penjualan"
        description="Pantau performa penjualan jamu harian, mingguan, dan bulanan."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportExcel}>
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={printPdf}>
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
          </>
        }
      />

      {/* Range tabs */}
      <div className="mb-6 inline-flex rounded-btn border border-black/10 bg-surface p-1">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={cn(
              "rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors",
              range === r.value
                ? "bg-primary text-primary-foreground"
                : "text-black/60 hover:text-primary"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Penjualan"
          value={formatCurrency(data?.totalSales ?? 0)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Jumlah Pesanan"
          value={data?.orderCount ?? 0}
          icon={<Receipt className="h-5 w-5" />}
          tone="accent"
        />
      </div>

      {/* Grafik sederhana */}
      <SectionCard title="Tren Penjualan" className="mt-6">
        <div className="flex h-48 items-end gap-2">
          {data?.series && data.series.length > 0 ? (
            data.series.map((s) => (
              <div key={s.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-primary/80"
                    style={{
                      height: `${Math.max(2, (s.total / maxSeries) * 100)}%`,
                    }}
                    title={formatCurrency(s.total)}
                  />
                </div>
                <span className="text-xs text-muted">{s.label}</span>
              </div>
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-sm text-muted">Belum ada data penjualan.</p>
            </div>
          )}
        </div>
      </SectionCard>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Produk Terlaris">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-black/45">
                <th className="pb-2 font-semibold">Produk</th>
                <th className="pb-2 text-right font-semibold">Qty</th>
                <th className="pb-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {data?.topProducts.map((p) => (
                <tr key={p.name}>
                  <td className="py-2 text-black/80">{p.name}</td>
                  <td className="py-2 text-right text-black/70">{p.qty}</td>
                  <td className="py-2 text-right font-medium text-primary">
                    {formatCurrency(p.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Metode Pembayaran">
          <ul className="space-y-3">
            {data?.byPayment.map((p) => {
              const pct = data.totalSales
                ? Math.round((p.total / data.totalSales) * 100)
                : 0;
              return (
                <li key={p.method}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-black/75">{p.method}</span>
                    <span className="text-black/60">
                      {formatCurrency(p.total)} • {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
