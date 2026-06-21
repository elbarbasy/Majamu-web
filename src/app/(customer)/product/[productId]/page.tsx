"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import { useUiStore } from "@/stores/ui-store";

/**
 * Deep-link Detail Produk (/product/[productId]). Detail tampil sebagai
 * bottom sheet (aturan wajib) yang dirender di layout; halaman ini membuka
 * sheet untuk produk terkait lalu mengarahkan ke homepage sebagai latar.
 */
export default function ProductDeepLinkPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const openProductDetail = useUiStore((s) => s.openProductDetail);

  React.useEffect(() => {
    if (params?.productId) {
      openProductDetail(params.productId);
    }
    router.replace("/");
  }, [params, openProductDetail, router]);

  return null;
}
