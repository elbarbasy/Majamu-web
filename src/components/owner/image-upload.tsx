"use client";

import * as React from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { uploadImage } from "@/services/storage.service";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket: string;
  label?: string;
  hint?: string;
  /** Rasio kotak preview (Tailwind aspect-*). */
  aspect?: string;
}

/**
 * Upload gambar (file) ke Supabase Storage → simpan URL publik.
 * Tidak menerima input link manual. Menampilkan preview + status unggah.
 */
export function ImageUpload({
  value,
  onChange,
  bucket,
  label,
  hint,
  aspect = "aspect-video",
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran maksimal 5MB.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(bucket, file);
      onChange(url);
    } catch {
      setError("Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-semibold text-black/80">
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative w-full overflow-hidden rounded-card border border-dashed border-black/20 bg-background",
          aspect
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-black/45"
          >
            <ImagePlus className="h-8 w-8" />
            <span className="text-xs font-medium">Pilih gambar untuk diunggah</span>
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70 text-primary">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-btn border border-black/15 px-3 py-2 text-xs font-semibold text-black/70 hover:border-primary/40 disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {value ? "Ganti Gambar" : "Unggah Gambar"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-btn border border-black/15 px-3 py-2 text-xs font-semibold text-error hover:border-error/40 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </button>
        )}
      </div>

      {hint && <p className="mt-1 text-xs text-black/45">{hint}</p>}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
