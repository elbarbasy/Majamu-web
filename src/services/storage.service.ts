/**
 * storage.service — upload file gambar ke Supabase Storage.
 * Mengembalikan URL publik untuk disimpan ke kolom (photo_url/image_url/logo_url).
 * Bila Supabase belum dikonfigurasi (dev), fallback ke data URL (base64)
 * agar preview tetap berfungsi.
 *
 * Bucket sesuai SUPABASE_SETUP.md: "products", "banners", "qr-codes".
 */
"use client";

import { createClient } from "@/lib/supabase/client";

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function randomName(file: File): string {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

export async function uploadImage(bucket: string, file: File): Promise<string> {
  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = createClient();
  } catch {
    // Supabase belum dikonfigurasi (dev) → data URL.
    return toDataUrl(file);
  }

  try {
    const path = randomName(file);
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.warn("[storage.service] upload gagal, fallback data URL:", err);
    return toDataUrl(file);
  }
}
