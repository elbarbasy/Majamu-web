"use client";

import * as React from "react";
import { Info } from "lucide-react";

import { CategoryChips } from "@/components/customer/category-chips";
import { HeroCarousel } from "@/components/customer/hero-carousel";
import { ProductGrid } from "@/components/customer/product-grid";
import { QuizRecommendationCard } from "@/components/customer/quiz-recommendation-card";
import { FILTER_ALL, FILTER_RECOMMENDED } from "@/constants";
import { getBanners, getProducts } from "@/services/products.service";
import { getStoreStatus } from "@/services/settings.service";
import type { Banner, Product } from "@/types";

/**
 * Homepage Customer — wellness premium.
 * Hero → Kategori → Quiz Card → Produk Populer → Semua Produk.
 * Semua data & logika lama dipertahankan.
 */
export default function CustomerHomePage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState<string>(FILTER_ALL);
  const [storeClosed, setStoreClosed] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    Promise.all([getProducts(), getBanners()]).then(([p, b]) => {
      if (!active) return;
      setProducts(p);
      setBanners(b);
      setLoading(false);
    });
    getStoreStatus().then((s) => {
      if (active) setStoreClosed(s === "closed");
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    if (activeFilter === FILTER_ALL) return products;
    return products.filter((p) => p.filterChips.includes(activeFilter));
  }, [products, activeFilter]);

  const popular = React.useMemo(
    () => products.filter((p) => p.filterChips.includes(FILTER_RECOMMENDED)),
    [products]
  );

  const showPopular = activeFilter === FILTER_ALL && popular.length > 0;

  return (
    <div className="pb-2">
      {storeClosed && (
        <div className="mx-4 mt-3 flex items-start gap-2 rounded-card border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-warning">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Toko sedang tutup. Anda tetap dapat melihat menu kami.
        </div>
      )}

      <HeroCarousel banners={banners} />

      <CategoryChips active={activeFilter} onSelect={setActiveFilter} />

      <QuizRecommendationCard />

      {showPopular && (
        <ProductGrid
          title="Produk Populer"
          subtitle="Paling diminati"
          products={popular}
        />
      )}

      <ProductGrid
        title={activeFilter === FILTER_ALL ? "Semua Produk" : activeFilter}
        subtitle={`${filtered.length} produk`}
        products={filtered}
        loading={loading}
      />
    </div>
  );
}
