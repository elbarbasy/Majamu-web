"use client";

import * as React from "react";
import { Store, Wallet } from "lucide-react";

import { ShiftNoteForm } from "@/components/cashier/shift-note-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { shiftCategoryLabel } from "@/constants";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import {
  closeCashSession,
  computeExpectedCash,
  fetchShiftNotes,
  getActiveSession,
  getThresholdSelisih,
  openCashSession,
  type CashSession,
} from "@/services/cashier.service";
import { useToastStore } from "@/stores/toast-store";
import type { ShiftNote } from "@/types";

/**
 * Halaman Catatan Shift — Sesi Kas (PRD v1.1 blind count).
 * Kasir TIDAK melihat omzet/selisih/kas seharusnya. Hanya:
 *   Buka Toko (modal awal) → catatan shift → Tutup Toko (hitung kas fisik).
 */
export default function ShiftPage() {
  const [notes, setNotes] = React.useState<ShiftNote[]>([]);
  const [session, setSession] = React.useState<CashSession | null | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [closeModal, setCloseModal] = React.useState(false);
  const [modalAwal, setModalAwal] = React.useState("");
  const [kasFisik, setKasFisik] = React.useState("");
  const [nudge, setNudge] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const push = useToastStore((s) => s.push);

  const reload = React.useCallback(() => {
    getActiveSession().then(setSession);
    fetchShiftNotes().then((data) => {
      setNotes(data);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => reload(), [reload]);

  async function handleOpen() {
    setSubmitting(true);
    const s = await openCashSession(Number(modalAwal) || 0);
    setSession(s);
    setOpenModal(false);
    setSubmitting(false);
    push({ tone: "success", message: "Toko dibuka. Selamat bekerja!" });
  }

  async function handleClose() {
    if (!session) return;
    const fisik = Number(kasFisik) || 0;

    // Cek threshold nudge (internal, kasir tidak lihat nilainya).
    if (!nudge) {
      const expected = await computeExpectedCash(session);
      const threshold = await getThresholdSelisih();
      const diff = Math.abs(fisik - expected);
      if (diff > threshold) {
        setNudge(true);
        return; // tampilkan nudge "coba hitung ulang"
      }
    }

    setSubmitting(true);
    await closeCashSession(session.id, fisik);
    setSession(null);
    setCloseModal(false);
    setNudge(false);
    setSubmitting(false);
    push({ tone: "success", message: "Toko ditutup. Sampai jumpa!" });
  }

  const sessionActive = session && session.status === "berjalan";

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold text-primary">Catatan Shift</h1>

      {/* Status Sesi Kas */}
      <div
        className={cn(
          "mb-4 flex items-center justify-between rounded-card p-5 shadow-soft",
          sessionActive
            ? "bg-green-600 text-white"
            : "bg-surface text-ink border border-line"
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl",
              sessionActive ? "bg-white/15" : "bg-primary/10"
            )}
          >
            <Store className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm opacity-80">
              {sessionActive ? "Toko Buka" : "Toko Belum Buka"}
            </p>
            {sessionActive ? (
              <p className="text-base font-bold">
                Sejak {formatDateTime(session.waktuBuka)}
              </p>
            ) : (
              <p className="text-base font-bold">Buka toko untuk mulai sesi kas.</p>
            )}
          </div>
        </div>

        {sessionActive ? (
          <Button
            className="border-none bg-white text-green-700 shadow-sm hover:bg-white/90"
            onClick={() => {
              setKasFisik("");
              setNudge(false);
              setCloseModal(true);
            }}
          >
            Tutup Toko
          </Button>
        ) : (
          <Button
            onClick={() => {
              setModalAwal("");
              setOpenModal(true);
            }}
          >
            Buka Toko
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Form catatan shift (tanpa proyeksi saldo — blind) */}
        <ShiftNoteForm onCreated={reload} />

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
                <li
                  key={n.id}
                  className="flex items-start justify-between gap-3 py-3"
                >
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

      {/* Modal: Buka Toko */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Buka Toko"
        description="Masukkan modal awal (uang tunai di laci saat ini)."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenModal(false)}>
              Batal
            </Button>
            <Button onClick={handleOpen} disabled={submitting}>
              {submitting ? "Memproses…" : "Buka Toko"}
            </Button>
          </>
        }
      >
        <div>
          <label className="mb-1 block text-sm font-semibold text-black/80">
            Modal Awal Hari Ini (Rp)
          </label>
          <input
            value={modalAwal}
            onChange={(e) => setModalAwal(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            placeholder="0"
            autoFocus
            className="h-12 w-full rounded-card border border-black/15 px-4 text-lg font-bold outline-none focus:border-primary"
          />
          <p className="mt-2 text-xs text-black/45">
            Kosongkan atau isi 0 jika belum ada modal.
          </p>
        </div>
      </Dialog>

      {/* Modal: Tutup Toko (blind count) */}
      <Dialog
        open={closeModal}
        onClose={() => setCloseModal(false)}
        title="Hitung Kas"
        description="Masukkan jumlah uang tunai yang benar-benar ada di laci."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCloseModal(false)}>
              Batal
            </Button>
            <Button onClick={handleClose} disabled={submitting}>
              {submitting ? "Memproses…" : "Konfirmasi"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <input
              value={kasFisik}
              onChange={(e) => {
                setKasFisik(e.target.value.replace(/[^0-9]/g, ""));
                setNudge(false); // reset nudge saat nilai berubah
              }}
              inputMode="numeric"
              placeholder="0"
              autoFocus
              className="h-12 w-full rounded-card border border-black/15 px-4 text-lg font-bold outline-none focus:border-primary"
            />
          </div>
          {nudge && (
            <div className="rounded-card bg-amber-50 p-4 text-center">
              <p className="text-sm font-semibold text-amber-700">
                Coba hitung ulang ya 😊
              </p>
              <p className="mt-1 text-xs text-amber-600">
                Anda bisa mengubah angka di atas atau langsung konfirmasi.
              </p>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
