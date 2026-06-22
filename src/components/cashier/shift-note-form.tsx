"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { SHIFT_NOTE_CATEGORIES } from "@/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { createShiftNote } from "@/services/cashier.service";

interface ShiftNoteFormProps {
  currentBalance?: number;
  onCreated?: () => void;
}

/** Arah perubahan saldo per kategori (untuk proyeksi). */
function balanceDelta(category: string, nominal: number): number {
  if (!nominal) return 0;
  if (category === "selisih_lebih") return nominal; // kas lebih → tambah
  if (category === "pengeluaran" || category === "selisih_kurang") return -nominal;
  return 0;
}

/**
 * Form Catatan Shift. Menampilkan saldo saat ini & saldo setelah perubahan
 * agar tidak ada penyesuaian kas "buta".
 */
export function ShiftNoteForm({ currentBalance = 0, onCreated }: ShiftNoteFormProps) {
  const [category, setCategory] = React.useState(SHIFT_NOTE_CATEGORIES[0].value);
  const [nominal, setNominal] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const meta = SHIFT_NOTE_CATEGORIES.find((c) => c.value === category);
  const withNominal = meta?.withNominal ?? false;

  const nominalNum = Number(nominal) || 0;
  const delta = balanceDelta(category, nominalNum);
  const projected = currentBalance + delta;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setDone(false);
    await createShiftNote({
      category,
      nominal: withNominal && nominal ? Number(nominal) : null,
      description,
    });
    setSaving(false);
    setDone(true);
    setNominal("");
    setDescription("");
    onCreated?.();
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-card bg-surface p-4 shadow-sm"
    >
      <div>
        <p className="mb-2 text-sm font-semibold text-black/80">Kategori</p>
        <div className="flex flex-wrap gap-2">
          {SHIFT_NOTE_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={cn(
                "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                category === c.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-black/15 bg-surface text-black/70 hover:border-primary/40"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {withNominal && (
        <div>
          <label className="mb-1 block text-sm font-semibold text-black/80">
            Nominal (Rp)
          </label>
          <input
            value={nominal}
            onChange={(e) => setNominal(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            placeholder="0"
            className="h-11 w-full rounded-card border border-black/15 px-3 text-base outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Proyeksi saldo (cegah penyesuaian buta) */}
      {withNominal && delta !== 0 && (
        <div className="rounded-card bg-background p-3 text-sm">
          <div className="flex items-center justify-between text-black/60">
            <span>Saldo Saat Ini</span>
            <span className="tabular-nums">{formatCurrency(currentBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-black/60">
            <span>{delta > 0 ? "Tambah Kas" : "Kurang Kas"}</span>
            <span
              className={cn(
                "tabular-nums font-semibold",
                delta > 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {delta > 0 ? "+" : "−"}
              {formatCurrency(Math.abs(delta))}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-black/10 pt-2 font-bold text-ink">
            <span>Saldo Setelah Perubahan</span>
            <span className="tabular-nums text-primary">
              {formatCurrency(projected)}
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-semibold text-black/80">
          Catatan
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Keterangan…"
          className="w-full resize-none rounded-card border border-black/15 p-3 text-base outline-none focus:border-primary"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Menyimpan…" : "Simpan Catatan"}
        </Button>
        {done && (
          <span className="text-sm font-medium text-success">Tersimpan ✓</span>
        )}
      </div>
    </form>
  );
}
