"use client";

import * as React from "react";
import { Info } from "lucide-react";

import { FilterChips } from "@/components/customer/filter-chips";
import { ProductGrid } from "@/components/customer/product-grid";
import { PromoBanner } from "@/components/customer/promo-banner";
import { QuizCard } from "@/components/customer/quiz-card";
import { FILTER_ALL } from "@/constants";
import { getBanners, getProducts } from "@/services/products.service";
import { getStoreStatus } from "@/services/settings.service";
import type { Banner, Product } from "@/types";

/**
 * Homepage Customer — herbal wellness premium.
 * Hero → Filter chips → Quiz card → Semua Produk.
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

  return (
    <div className="pb-2">
      {storeClosed && (
        <div className="mx-4 mt-3 flex items-start gap-2 rounded-card border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-warning">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Toko sedang tutup. Anda tetap dapat melihat menu kami.
        </div>
      )}

      <PromoBanner banners={banners} />

      <FilterChips active={activeFilter} onSelect={setActiveFilter} />

      <QuizCard />

      <ProductGrid
        title={activeFilter === FILTER_ALL ? "Semua Produk" : activeFilter}
        subtitle={`${filtered.length} produk`}
        products={filtered}
        loading={loading}
      />
    </div>
  );
}
