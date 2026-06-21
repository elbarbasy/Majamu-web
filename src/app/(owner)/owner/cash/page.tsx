"use client";

import * as React from "react";
import { ArrowDownCircle, ArrowUpCircle, Plus, Trash2, Wallet } from "lucide-react";

import { PageHeader } from "@/components/owner/page-header";
import { SectionCard } from "@/components/owner/section-card";
import { StatCard } from "@/components/owner/stat-card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import {
  createCashEntry,
  deleteCashEntry,
  listCashEntries,
} from "@/services/owner.service";
import type { CashEntryItem } from "@/lib/owner-store";

function isToday(iso: string) {
  return iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
}
function isThisMonth(iso: string) {
  return iso.slice(0, 7) === new Date().toISOString().slice(0, 7);
}

export default function CashPage() {
  const [entries, setEntries] = React.useState<CashEntryItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<"income" | "expense">("income");
  const [category, setCategory] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");

  const reload = React.useCallback(() => {
    listCashEntries().then(setEntries);
  }, []);
  React.useEffect(() => reload(), [reload]);

  const incomeToday = entries
    .filter((e) => e.type === "income" && isToday(e.createdAt))
    .reduce((s, e) => s + e.amount, 0);
  const expenseToday = entries
    .filter((e) => e.type === "expense" && isToday(e.createdAt))
    .reduce((s, e) => s + e.amount, 0);
  const balanceMonth = entries
    .filter((e) => isThisMonth(e.createdAt))
    .reduce((s, e) => s + (e.type === "income" ? e.amount : -e.amount), 0);

  async function submit() {
    if (!category || !amount) return;
    await createCashEntry({
      type,
      category,
      amount: Number(amount),
      description,
    });
    setOpen(false);
    setCategory("");
    setAmount("");
    setDescription("");
    setType("income");
    reload();
  }

  async function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await deleteCashEntry(id);
  }

  return (
    <div>
      <PageHeader
        title="Kas"
        description="Catat pemasukan & pengeluaran warung, lihat rekap harian dan bulanan."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Tambah Transaksi
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Pemasukan Hari Ini"
          value={formatCurrency(incomeToday)}
          icon={<ArrowUpCircle className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Pengeluaran Hari Ini"
          value={formatCurrency(expenseToday)}
          icon={<ArrowDownCircle className="h-5 w-5" />}
          tone="warning"
        />
        <StatCard
          label="Saldo Bulan Ini"
          value={formatCurrency(balanceMonth)}
          icon={<Wallet className="h-5 w-5" />}
          tone="primary"
        />
      </div>

      <SectionCard title="Riwayat Kas" className="mt-6">
        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-black/50">
            Belum ada transaksi kas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-black/45">
                  <th className="pb-2 font-semibold">Waktu</th>
                  <th className="pb-2 font-semibold">Kategori</th>
                  <th className="pb-2 font-semibold">Keterangan</th>
                  <th className="pb-2 text-right font-semibold">Nominal</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2.5 text-black/55">
                      {formatDateTime(e.createdAt)}
                    </td>
                    <td className="py-2.5 font-medium text-black/80">
                      {e.category}
                    </td>
                    <td className="py-2.5 text-black/55">{e.description || "-"}</td>
                    <td
                      className={cn(
                        "py-2.5 text-right font-bold",
                        e.type === "income" ? "text-accent" : "text-warning"
                      )}
                    >
                      {e.type === "income" ? "+" : "-"}
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => remove(e.id)}
                        aria-label="Hapus"
                        className="text-black/40 hover:text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Tambah Transaksi Kas"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={submit}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["income", "expense"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-card border p-3 text-sm font-semibold transition-colors",
                  type === t
                    ? t === "income"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-warning bg-warning/10 text-warning"
                    : "border-black/15 text-black/60"
                )}
              >
                {t === "income" ? "Pemasukan" : "Pengeluaran"}
              </button>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              Kategori
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="mis. Penjualan, Belanja Bahan"
              className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              Nominal (Rp)
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              placeholder="0"
              className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              Keterangan
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Opsional"
              className="w-full resize-none rounded-card border border-black/15 p-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
