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

      {/* Grafik Tren Penjualan */}
      <SectionCard title="Tren Penjualan" className="mt-6">
        {data?.series && data.series.length > 0 ? (
          <div>
            {/* Chart area */}
            <div className="flex items-end gap-1.5" style={{ height: "200px" }}>
              {data.series.map((s) => {
                const heightPx = Math.max(4, Math.round((s.total / maxSeries) * 180));
                return (
                  <div
                    key={s.label}
                    className="group relative flex-1"
                    style={{ height: "100%" }}
                  >
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#5B3E2A] px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                      {formatCurrency(s.total)}
                    </div>
                    {/* Bar */}
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-md bg-[#6B4F3A] transition-all group-hover:bg-[#D4A373]"
                      style={{ height: `${heightPx}px` }}
                    />
                  </div>
                );
              })}
            </div>
            {/* X-axis labels */}
            <div className="mt-2 flex gap-1.5">
              {data.series.map((s) => (
                <div key={s.label} className="flex-1 text-center text-xs text-muted">
                  {s.label}
                </div>
              ))}
            </div>
            {/* Summary line */}
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
              <span className="text-muted">Total periode ini</span>
              <span className="font-bold tabular text-ink">
                {formatCurrency(data.series.reduce((s, d) => s + d.total, 0))}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-muted">Belum ada data penjualan.</p>
          </div>
        )}
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
