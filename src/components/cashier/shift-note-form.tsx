"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { SHIFT_NOTE_CATEGORIES } from "@/constants";
import { cn } from "@/lib/utils";
import { createShiftNote } from "@/services/cashier.service";

interface ShiftNoteFormProps {
  onCreated?: () => void;
}

/**
 * Form Catatan Shift v1.1: Pengeluaran, Tambah Modal, Catatan Kas, Lainnya.
 * TANPA proyeksi saldo (blind count principle). Kasir tidak melihat
 * kas seharusnya / selisih / omzet.
 */
export function ShiftNoteForm({ onCreated }: ShiftNoteFormProps) {
  const [category, setCategory] = React.useState(SHIFT_NOTE_CATEGORIES[0].value);
  const [nominal, setNominal] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const meta = SHIFT_NOTE_CATEGORIES.find((c) => c.value === category);
  const withNominal = meta?.withNominal ?? false;

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
