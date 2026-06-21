"use client";

import * as React from "react";
import { History, KeyRound, Pencil, Plus, UserCog } from "lucide-react";

import { PageHeader } from "@/components/owner/page-header";
import { SectionCard } from "@/components/owner/section-card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatDateTime } from "@/lib/utils";
import {
  createCashier,
  listActivityLogs,
  listCashiers,
  setCashierActive,
  upsertCashier,
} from "@/services/owner.service";
import type { ActivityLogItem, CashierItem } from "@/lib/owner-store";

export default function CashiersPage() {
  const [cashiers, setCashiers] = React.useState<CashierItem[]>([]);
  const [logs, setLogs] = React.useState<ActivityLogItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CashierItem | null>(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const reload = React.useCallback(() => {
    listCashiers().then(setCashiers);
    listActivityLogs().then(setLogs);
  }, []);
  React.useEffect(() => reload(), [reload]);

  function openCreate() {
    setEditing(null);
    setName("");
    setEmail("");
    setPassword("");
    setIsActive(true);
    setFormError(null);
    setOpen(true);
  }
  function openEdit(c: CashierItem) {
    setEditing(c);
    setName(c.name);
    setEmail(c.email);
    setPassword("");
    setIsActive(c.isActive);
    setFormError(null);
    setOpen(true);
  }
  async function save() {
    if (!name.trim() || !email.trim()) return;
    setFormError(null);
    try {
      if (editing) {
        await upsertCashier({
          id: editing.id,
          name: name.trim(),
          email: email.trim(),
          isActive,
        });
      } else {
        if (!password.trim()) {
          setFormError("Password wajib untuk kasir baru.");
          return;
        }
        await createCashier({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        });
      }
      setOpen(false);
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Gagal menyimpan kasir.");
    }
  }
  async function toggleActive(c: CashierItem) {
    setCashiers((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, isActive: !x.isActive } : x))
    );
    await setCashierActive(c.id, !c.isActive);
  }
  function resetPassword(c: CashierItem) {
    setToast(`Tautan reset password dikirim ke ${c.email}`);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div>
      <PageHeader
        title="Kelola Kasir"
        description="Tambah, nonaktifkan, dan reset akun kasir. Pantau log aktivitas."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah Kasir
          </Button>
        }
      />

      {toast && (
        <div className="mb-4 rounded-card bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Daftar Kasir" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-black/45">
                  <th className="pb-2 font-semibold">Nama</th>
                  <th className="pb-2 font-semibold">Email</th>
                  <th className="pb-2 text-center font-semibold">Aktif</th>
                  <th className="pb-2 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {cashiers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserCog className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-black/85">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-black/60">{c.email}</td>
                    <td className="py-3">
                      <div className="flex justify-center">
                        <Switch
                          checked={c.isActive}
                          onChange={() => toggleActive(c)}
                        />
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => resetPassword(c)}
                          aria-label="Reset password"
                          title="Reset Password"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-warning/10 hover:text-warning"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          aria-label="Edit"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cashiers.length === 0 && (
              <p className="py-8 text-center text-sm text-black/50">
                Belum ada kasir.
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Log Aktivitas">
          <ul className="space-y-3">
            {logs.map((l) => (
              <li key={l.id} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/30 text-secondary-foreground">
                  <History className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm text-black/80">{l.description}</p>
                  <p className="text-xs text-black/40">
                    {formatDateTime(l.createdAt)}
                  </p>
                </div>
              </li>
            ))}
            {logs.length === 0 && (
              <p className="text-sm text-black/50">Belum ada aktivitas.</p>
            )}
          </ul>
        </SectionCard>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Kasir" : "Tambah Kasir"}
        description={
          editing
            ? undefined
            : "Akun kasir dibuat oleh owner (PRD). Kredensial dikelola via Supabase Auth."
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-card bg-error/10 px-3 py-2 text-sm text-error">
              {formError}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              Nama
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          {!editing && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-black/80">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder="Min. 6 karakter"
                className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
              />
              <p className="mt-1 text-xs text-black/45">
                Kredensial login kasir dibuat di Supabase Auth.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between rounded-card bg-background p-3">
            <span className="text-sm font-semibold text-black/80">
              Akun Aktif
            </span>
            <Switch checked={isActive} onChange={setIsActive} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
