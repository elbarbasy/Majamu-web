"use client";

import * as React from "react";

import { FilterChips } from "@/components/customer/filter-chips";
import { ProductGrid } from "@/components/customer/product-grid";
import { PromoBanner } from "@/components/customer/promo-banner";
import { QuizCard } from "@/components/customer/quiz-card";
import { FILTER_ALL, FILTER_RECOMMENDED } from "@/constants";
import { getBanners, getProducts } from "@/services/products.service";
import { getStoreStatus } from "@/services/settings.service";
import type { Banner, Product } from "@/types";

/**
 * Homepage Customer (WIREFRAMES.md / CUSTOMER_UI.md):
 * Header (layout) -> Banner -> Filter Chips -> Quiz Card (inline) ->
 * Produk Populer -> Semua Produk -> Floating Cart Bar (layout).
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
    <div>
      {storeClosed && (
        <div className="mx-4 mt-3 rounded-card bg-warning/10 px-4 py-3 text-sm font-medium text-warning">
          Maaf, toko sedang tutup saat ini. Anda tetap dapat melihat menu.
        </div>
      )}

      <PromoBanner banners={banners} />

      <FilterChips active={activeFilter} onSelect={setActiveFilter} />

      <QuizCard />

      {showPopular && (
        <ProductGrid title="Produk Populer" products={popular} />
      )}

      <ProductGrid
        title={activeFilter === FILTER_ALL ? "Semua Produk" : activeFilter}
        products={filtered}
        loading={loading}
      />
    </div>
  );
}
