"use client";

import * as React from "react";
import Image from "next/image";
import { Download, Pencil, Plus, QrCode, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/owner/page-header";
import { SectionCard } from "@/components/owner/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { buildTableUrl, qrImageUrl } from "@/lib/qr";
import {
  deleteTable,
  listTables,
  upsertTable,
} from "@/services/owner.service";
import type { TableItem } from "@/lib/owner-store";

export default function TablesPage() {
  const [tables, setTables] = React.useState<TableItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TableItem | null>(null);
  const [tableNumber, setTableNumber] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const reload = React.useCallback(() => {
    listTables().then(setTables);
  }, []);
  React.useEffect(() => reload(), [reload]);

  function openCreate() {
    setEditing(null);
    setTableNumber(String((tables.at(-1)?.tableNumber ?? 0) + 1));
    setIsActive(true);
    setOpen(true);
  }
  function openEdit(t: TableItem) {
    setEditing(t);
    setTableNumber(String(t.tableNumber));
    setIsActive(t.isActive);
    setOpen(true);
  }
  async function save() {
    const num = Number(tableNumber);
    if (!num) return;
    await upsertTable({ id: editing?.id, tableNumber: num, isActive });
    setOpen(false);
    reload();
  }
  async function remove(id: string) {
    setTables((prev) => prev.filter((t) => t.id !== id));
    await deleteTable(id);
  }

  return (
    <div>
      <PageHeader
        title="QR Meja"
        description="Generate & unduh QR per meja. Pelanggan scan untuk memesan."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah Meja
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tables.map((t) => {
          const url = buildTableUrl(t.tableNumber);
          const img = qrImageUrl(url, 240);
          return (
            <SectionCard key={t.id} className="flex flex-col items-center">
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-bold text-primary">
                  Meja {t.tableNumber}
                </span>
                <Badge variant={t.isActive ? "success" : "neutral"}>
                  {t.isActive ? "Aktif" : "Off"}
                </Badge>
              </div>
              <div className="relative my-3 aspect-square w-full overflow-hidden rounded-card bg-white ring-1 ring-black/5">
                <Image
                  src={img}
                  alt={`QR Meja ${t.tableNumber}`}
                  fill
                  unoptimized
                  className="object-contain p-2"
                  sizes="200px"
                />
              </div>
              <div className="flex w-full items-center justify-between gap-1">
                <a
                  href={img}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1 rounded-btn bg-primary px-2 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <Download className="h-3.5 w-3.5" />
                  QR
                </a>
                <button
                  onClick={() => openEdit(t)}
                  aria-label="Edit"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(t.id)}
                  aria-label="Hapus"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </SectionCard>
          );
        })}
        {tables.length === 0 && (
          <SectionCard className="col-span-full">
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <QrCode className="h-10 w-10 text-secondary" />
              <p className="text-sm text-black/50">Belum ada meja.</p>
            </div>
          </SectionCard>
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Meja" : "Tambah Meja"}
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
          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              Nomor Meja
            </label>
            <input
              value={tableNumber}
              onChange={(e) =>
                setTableNumber(e.target.value.replace(/[^0-9]/g, ""))
              }
              inputMode="numeric"
              className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-between rounded-card bg-background p-3">
            <span className="text-sm font-semibold text-black/80">Aktif</span>
            <Switch checked={isActive} onChange={setIsActive} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
