/**
 * storage.service — upload file gambar ke Supabase Storage.
 * Mengembalikan URL publik untuk disimpan ke kolom (photo_url/image_url/logo_url).
 *
 * Strategi:
 * 1. Coba upload ke Supabase Storage → kembalikan public URL.
 * 2. Jika gagal (bucket belum ada / policy salah / env kosong) → fallback data URL.
 * 3. Data URL tetap berfungsi sebagai preview & tersimpan di DB (≤5MB).
 *
 * Bucket sesuai SUPABASE_SETUP.md: "products", "banners", "qr-codes".
 */
"use client";

import { createClient } from "@/lib/supabase/client";

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // PNG & SVG: langsung baca tanpa resize (pertahankan transparansi & vektor).
    if (file.type === "image/png" || file.type === "image/svg+xml") {
      console.info("[storage] PNG/SVG detected, reading directly (no canvas)");
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result);
        console.info("[storage] data URL starts with:", result.substring(0, 30));
        resolve(result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
      return;
    }

    // Non-PNG (JPG dll): resize + kompres via canvas.
    const img = new Image();
    img.onload = () => {
      const MAX = 600;
      let w = img.width;
      let h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) {
          h = Math.round(h * (MAX / w));
          w = MAX;
        } else {
          w = Math.round(w * (MAX / h));
          h = MAX;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    };
    img.src = URL.createObjectURL(file);
  });
}

function randomName(file: File): string {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

export async function uploadImage(bucket: string, file: File): Promise<string> {
  // Selalu siapkan data URL sebagai fallback pasti-muncul.
  const dataUrl = await toDataUrl(file);

  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = createClient();
  } catch {
    // Supabase belum dikonfigurasi → pakai data URL.
    console.info("[storage] Supabase not configured, using data URL");
    return dataUrl;
  }

  try {
    const path = randomName(file);
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

    if (error) {
      console.warn("[storage] Upload error:", error.message, "→ using data URL");
      return dataUrl;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = data?.publicUrl;

    if (!publicUrl) {
      console.warn("[storage] No public URL returned → using data URL");
      return dataUrl;
    }

    // Verifikasi URL bisa diakses (cegah 403/404 silent).
    try {
      const check = await fetch(publicUrl, { method: "HEAD" });
      if (!check.ok) {
        console.warn("[storage] Public URL not accessible:", check.status, "→ using data URL");
        return dataUrl;
      }
    } catch {
      // Fetch gagal (CORS / network) → tetap coba pakai URL (mungkin OK di browser).
      console.info("[storage] HEAD check failed (CORS?), using public URL anyway");
    }

    console.info("[storage] Upload success:", publicUrl);
    return publicUrl;
  } catch (err) {
    console.warn("[storage] Unexpected error:", err, "→ using data URL");
    return dataUrl;
  }
}
