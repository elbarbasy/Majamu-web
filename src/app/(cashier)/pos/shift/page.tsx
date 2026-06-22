"use client";

import * as React from "react";
import { Wallet } from "lucide-react";

import { ShiftNoteForm } from "@/components/cashier/shift-note-form";
import { shiftCategoryLabel } from "@/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { fetchShiftNotes, getCashBalance } from "@/services/cashier.service";
import type { ShiftNote } from "@/types";

/** Catatan Shift (CASHIER_UI.md). Saldo kas + form + daftar catatan. */
export default function ShiftPage() {
  const [notes, setNotes] = React.useState<ShiftNote[]>([]);
  const [balance, setBalance] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(() => {
    fetchShiftNotes().then((data) => {
      setNotes(data);
      setLoading(false);
    });
    getCashBalance().then(setBalance);
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold text-primary">Catatan Shift</h1>

      {/* Saldo kas saat ini (selalu terlihat sebelum penyesuaian) */}
      <div className="mb-4 flex items-center justify-between rounded-card bg-primary p-5 text-primary-foreground shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <Wallet className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm opacity-80">Saldo Kas Saat Ini</p>
            <p className="text-2xl font-extrabold tabular-nums">
              {balance == null ? "…" : formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ShiftNoteForm currentBalance={balance ?? 0} onCreated={reload} />

        <div className="rounded-card bg-surface p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-black/80">
            Catatan Terbaru
          </h2>
          {loading ? (
            <p className="py-6 text-center text-sm text-black/50">Memuat…</p>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Wallet className="h-10 w-10 text-secondary" />
              <p className="text-sm text-black/55">Belum ada catatan shift.</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {notes.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black/80">
                      {shiftCategoryLabel(n.category)}
                    </p>
                    {n.description && (
                      <p className="text-xs text-black/55">{n.description}</p>
                    )}
                    <p className="text-xs text-black/40">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                  {n.nominal != null && (
                    <span className="shrink-0 text-sm font-bold tabular-nums text-primary">
                      {formatCurrency(n.nominal)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
