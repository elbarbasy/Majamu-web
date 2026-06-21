"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/owner/page-header";
import { SectionCard } from "@/components/owner/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  deleteBanner,
  listBanners,
  upsertBanner,
} from "@/services/owner.service";
import type { BannerItem } from "@/lib/owner-store";

export default function BannersPage() {
  const [banners, setBanners] = React.useState<BannerItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BannerItem | null>(null);
  const [title, setTitle] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const reload = React.useCallback(() => {
    listBanners().then(setBanners);
  }, []);
  React.useEffect(() => reload(), [reload]);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setImageUrl("");
    setIsActive(true);
    setOpen(true);
  }
  function openEdit(b: BannerItem) {
    setEditing(b);
    setTitle(b.title);
    setImageUrl(b.imageUrl ?? "");
    setIsActive(b.isActive);
    setOpen(true);
  }
  async function save() {
    if (!title.trim()) return;
    await upsertBanner({
      id: editing?.id,
      title: title.trim(),
      imageUrl: imageUrl.trim() || null,
      isActive,
    });
    setOpen(false);
    reload();
  }
  async function remove(id: string) {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    await deleteBanner(id);
  }
  async function toggle(b: BannerItem) {
    setBanners((prev) =>
      prev.map((x) => (x.id === b.id ? { ...x, isActive: !x.isActive } : x))
    );
    await upsertBanner({ ...b, isActive: !b.isActive });
  }

  return (
    <div>
      <PageHeader
        title="Banner Promo"
        description="Kelola banner promosi yang tampil di halaman pelanggan."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah Banner
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {banners.map((b) => (
          <SectionCard key={b.id}>
            <div className="relative mb-3 aspect-[16/7] w-full overflow-hidden rounded-card bg-gradient-to-br from-primary to-secondary">
              {b.imageUrl ? (
                <Image
                  src={b.imageUrl}
                  alt={b.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
              ) : (
                <div className="flex h-full w-full items-end p-4">
                  <span className="text-base font-bold text-white drop-shadow">
                    {b.title}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-black/85">{b.title}</p>
                <Badge variant={b.isActive ? "success" : "neutral"}>
                  {b.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={b.isActive} onChange={() => toggle(b)} />
                <button
                  onClick={() => openEdit(b)}
                  aria-label="Edit"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(b.id)}
                  aria-label="Hapus"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </SectionCard>
        ))}
        {banners.length === 0 && (
          <SectionCard className="md:col-span-2">
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <ImageIcon className="h-10 w-10 text-secondary" />
              <p className="text-sm text-black/50">Belum ada banner.</p>
            </div>
          </SectionCard>
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Banner" : "Tambah Banner"}
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
              Judul Banner
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              URL Gambar <span className="font-normal text-black/40">(opsional)</span>
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
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
