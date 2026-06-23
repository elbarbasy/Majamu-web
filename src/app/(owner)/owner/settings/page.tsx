"use client";

import * as React from "react";
import Link from "next/link";
import { Check, GalleryHorizontalEnd } from "lucide-react";

import { PageHeader } from "@/components/owner/page-header";
import { SectionCard } from "@/components/owner/section-card";
import { ImageUpload } from "@/components/owner/image-upload";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PAYMENT_METHODS } from "@/constants";
import { cn } from "@/lib/utils";
import {
  getStoreSettings,
  updateStoreSettings,
} from "@/services/owner.service";
import type { StoreSettingsData } from "@/lib/owner-store";

const DAYS: { key: string; label: string }[] = [
  { key: "mon", label: "Senin" },
  { key: "tue", label: "Selasa" },
  { key: "wed", label: "Rabu" },
  { key: "thu", label: "Kamis" },
  { key: "fri", label: "Jumat" },
  { key: "sat", label: "Sabtu" },
  { key: "sun", label: "Minggu" },
];

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<StoreSettingsData | null>(null);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    getStoreSettings().then(setSettings);
  }, []);

  if (!settings) {
    return (
      <div>
        <PageHeader title="Pengaturan" />
        <p className="text-sm text-black/50">Memuat…</p>
      </div>
    );
  }

  function patch(p: Partial<StoreSettingsData>) {
    setSettings((s) => (s ? { ...s, ...p } : s));
  }
  function patchHours(
    day: string,
    field: "open" | "close" | "closed",
    value: string | boolean
  ) {
    setSettings((s) =>
      s
        ? {
            ...s,
            operationalHours: {
              ...s.operationalHours,
              [day]: { ...s.operationalHours[day], [field]: value },
            },
          }
        : s
    );
  }
  function togglePayment(method: string) {
    setSettings((s) => {
      if (!s) return s;
      const has = s.paymentMethods.includes(method);
      return {
        ...s,
        paymentMethods: has
          ? s.paymentMethods.filter((m) => m !== method)
          : [...s.paymentMethods, method],
      };
    });
  }

  async function save() {
    if (!settings) return;
    await updateStoreSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        description="Profil toko, jam operasional, pembayaran, dan sistem."
        actions={
          <Button size="sm" onClick={save}>
            {saved ? (
              <>
                <Check className="h-4 w-4" /> Tersimpan
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profil Toko */}
        <SectionCard title="Profil Toko">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-black/80">
                Nama Brand
              </label>
              <input
                value={settings.storeName}
                onChange={(e) => patch({ storeName: e.target.value })}
                className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-black/80">
                Tagline
              </label>
              <input
                value={settings.tagline}
                onChange={(e) => patch({ tagline: e.target.value })}
                placeholder="mis. Jamu modern, hangat & menyehatkan"
                className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-black/80">
                Tentang Majamu (Brand Story)
              </label>
              <textarea
                value={settings.brandStory}
                onChange={(e) => patch({ brandStory: e.target.value })}
                rows={4}
                placeholder="Ceritakan tentang brand Anda…"
                className="w-full resize-none rounded-card border border-black/15 p-3 text-sm outline-none focus:border-primary"
              />
              <p className="mt-1 text-xs text-black/45">
                Tampil otomatis di menu pelanggan → Tentang Majamu.
              </p>
            </div>
            <ImageUpload
              label="Gambar Quiz (kartu rekomendasi)"
              bucket="banners"
              aspect="aspect-[16/9]"
              value={settings.quizImageUrl}
              onChange={(url) => patch({ quizImageUrl: url })}
              hint="Unggah dari perangkat (maks 5MB). Kosongkan untuk gradient default."
            />
            <ImageUpload
              label="Logo Panel Informasi"
              bucket="banners"
              aspect="aspect-[3/1]"
              value={settings.panelLogoUrl}
              onChange={(url) => patch({ panelLogoUrl: url })}
              hint="Logo khusus untuk panel/drawer (SVG/PNG transparan). Berbeda dari logo header."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-black/80">
                  WhatsApp
                </label>
                <input
                  value={settings.storeWhatsapp}
                  onChange={(e) =>
                    patch({ storeWhatsapp: e.target.value.replace(/[^0-9]/g, "") })
                  }
                  inputMode="tel"
                  placeholder="628xxxxxxxxxx"
                  className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-black/80">
                  Instagram
                </label>
                <input
                  value={settings.instagram}
                  onChange={(e) => patch({ instagram: e.target.value })}
                  placeholder="@majamu.id"
                  className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-black/80">
                Alamat
              </label>
              <textarea
                value={settings.address}
                onChange={(e) => patch({ address: e.target.value })}
                rows={2}
                placeholder="Alamat toko…"
                className="w-full resize-none rounded-card border border-black/15 p-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <ImageUpload
              label="Logo Toko"
              bucket="banners"
              aspect="aspect-[3/1]"
              value={settings.logoUrl}
              onChange={(url) => patch({ logoUrl: url })}
              hint="Upload file SVG atau PNG transparan agar menyatu dengan warna app. Maks 5MB."
            />
            <Link
              href="/owner/banners"
              className="flex items-center justify-between rounded-card border border-black/15 px-4 py-3 text-sm font-semibold text-black/80 hover:border-primary/40"
            >
              <span className="flex items-center gap-2">
                <GalleryHorizontalEnd className="h-5 w-5 text-primary" />
                Banner Homepage
              </span>
              <span className="text-xs font-medium text-primary">Kelola →</span>
            </Link>
          </div>
        </SectionCard>

        {/* Status & Sistem */}
        <SectionCard title="Status & Sistem">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-card bg-background p-3">
              <div>
                <p className="text-sm font-semibold text-black/80">Status Toko</p>
                <p className="text-xs text-black/50">
                  {settings.storeStatus === "open" ? "Buka" : "Tutup"}
                </p>
              </div>
              <Switch
                checked={settings.storeStatus === "open"}
                onChange={(v) => patch({ storeStatus: v ? "open" : "closed" })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-black/80">
                Ambang Urgensi Pesanan (menit)
              </label>
              <input
                value={settings.urgencyThresholdMinutes}
                onChange={(e) =>
                  patch({
                    urgencyThresholdMinutes: Number(
                      e.target.value.replace(/[^0-9]/g, "")
                    ),
                  })
                }
                inputMode="numeric"
                className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
              />
              <p className="mt-1 text-xs text-black/45">
                Timer kasir berubah merah setelah melewati ambang ini.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-black/80">
                Ambang Selisih Kas (Rp)
              </label>
              <input
                value={settings.thresholdSelisihKas}
                onChange={(e) =>
                  patch({
                    thresholdSelisihKas: Number(
                      e.target.value.replace(/[^0-9]/g, "")
                    ),
                  })
                }
                inputMode="numeric"
                className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
              />
              <p className="mt-1 text-xs text-black/45">
                Jika selisih melebihi ini, kasir diminta hitung ulang saat tutup toko.
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-black/80">
                Metode Pembayaran
              </p>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((m) => {
                  const active = settings.paymentMethods.includes(m.value);
                  return (
                    <button
                      key={m.value}
                      onClick={() => togglePayment(m.value)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-black/15 text-black/60"
                      )}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Jam Operasional */}
        <SectionCard title="Jam Operasional" className="lg:col-span-2">
          <div className="space-y-2">
            {DAYS.map((d) => {
              const h = settings.operationalHours[d.key] ?? {
                open: "08:00",
                close: "21:00",
                closed: false,
              };
              return (
                <div
                  key={d.key}
                  className="flex flex-wrap items-center gap-3 rounded-card border border-black/10 p-3"
                >
                  <span className="w-20 text-sm font-semibold text-black/80">
                    {d.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={h.open}
                      disabled={h.closed}
                      onChange={(e) => patchHours(d.key, "open", e.target.value)}
                      className="rounded-card border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-primary disabled:opacity-40"
                    />
                    <span className="text-black/40">–</span>
                    <input
                      type="time"
                      value={h.close}
                      disabled={h.closed}
                      onChange={(e) =>
                        patchHours(d.key, "close", e.target.value)
                      }
                      className="rounded-card border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-primary disabled:opacity-40"
                    />
                  </div>
                  <label className="ml-auto flex items-center gap-2 text-sm text-black/60">
                    Tutup
                    <Switch
                      checked={h.closed}
                      onChange={(v) => patchHours(d.key, "closed", v)}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
