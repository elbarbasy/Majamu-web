/**
 * settings.service — pengaturan toko untuk sisi publik (pelanggan).
 * Supabase-first; fallback ke owner-store (dev) agar konten dinamis tetap
 * konsisten dengan yang diatur Owner tanpa Supabase.
 */
"use client";

import { createClient } from "@/lib/supabase/client";
import { ownerDb } from "@/lib/owner-store";

export interface PublicSettings {
  storeName: string;
  tagline: string;
  brandStory: string;
  quizImageUrl: string | null;
  logoUrl: string | null;
  whatsapp: string;
  instagram: string;
  address: string;
  storeStatus: "open" | "closed";
}

function fromOwnerStore(): PublicSettings {
  const s = ownerDb().settings;
  return {
    storeName: s.storeName,
    tagline: s.tagline,
    brandStory: s.brandStory,
    quizImageUrl: s.quizImageUrl,
    logoUrl: s.logoUrl,
    whatsapp: s.storeWhatsapp,
    instagram: s.instagram,
    address: s.address,
    storeStatus: s.storeStatus,
  };
}

export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("store_settings")
      .select(
        "store_name, tagline, brand_story, quiz_image_url, logo_url, store_whatsapp, instagram, address, store_status"
      )
      .limit(1)
      .maybeSingle();
    if (!data) return fromOwnerStore();
    return {
      storeName: data.store_name ?? "Majamu",
      tagline: data.tagline ?? "",
      brandStory: data.brand_story ?? "",
      quizImageUrl: data.quiz_image_url ?? null,
      logoUrl: data.logo_url ?? null,
      whatsapp: data.store_whatsapp ?? "",
      instagram: data.instagram ?? "",
      address: data.address ?? "",
      storeStatus: (data.store_status as "open" | "closed") ?? "open",
    };
  } catch {
    return fromOwnerStore();
  }
}

export async function getStoreStatus(): Promise<"open" | "closed"> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("store_status")
      .limit(1)
      .maybeSingle();
    if (!data) return ownerDb().settings.storeStatus;
    return (data.store_status as "open" | "closed") ?? "open";
  } catch {
    return ownerDb().settings.storeStatus;
  }
}
