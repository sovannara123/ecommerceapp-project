"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useProducts } from "@/features/catalog/hooks/useProducts";
import type { ProductFilters, ProductSort } from "@/features/catalog/types";
import { useCartMutations } from "@/features/cart/hooks/useCart";
import { useDebounce } from "@/hooks/useDebounce";
import { normalizeApiError } from "@/shared/api/error";
import { ProductCard } from "@/shared/ui/commerce/ProductCard";
import { Pagination } from "@/shared/ui/commerce/Pagination";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { LoadingSkeleton } from "@/shared/ui/feedback/LoadingSkeleton";

export function ProductGrid() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sort, setSort] = useState<ProductSort>("new");
  const debouncedQuery = useDebounce(query, 300);

  const products = useProducts({
    q: debouncedQuery || undefined,
    categoryId: filters.categoryId || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    rating: filters.rating || undefined,
    brand: filters.brand || undefined,
    sort,
    limit: 12,
  });
  const cart = useCartMutations();

  const allItems = products.data?.pages.flatMap((page) => page.items) ?? [];

  const onAdd = async (id: string) => {
    try {
      await cart.add.mutateAsync({ productId: id, qty: 1 });
      toast.success("Added to cart");
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  if (products.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <LoadingSkeleton key={idx} className="h-72" />
        ))}
      </div>
    );
  }

  if (!allItems.length) {
    return <EmptyState title="No products found" description="Try changing filters or check back later." />;
  }

  return (
    <div className="space-y-6">
      {/* TODO: replace with dedicated search bar component when catalog toolbar is extracted */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-600">Search:</span>
        <input
          className="rounded-md border border-slate-300 px-2 py-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products"
        />
      </div>
      {/* TODO: replace with filter sidebar component when category/facet APIs are finalized */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-600">Filters:</span>
        <input
          className="w-24 rounded-md border border-slate-300 px-2 py-1"
          type="number"
          placeholder="Min"
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              minPrice: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />
        <input
          className="w-24 rounded-md border border-slate-300 px-2 py-1"
          type="number"
          placeholder="Max"
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              maxPrice: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-600">Sort:</span>
        <select
          className="rounded-md border border-slate-300 px-2 py-1"
          value={sort}
          onChange={(e) => setSort(e.target.value as ProductSort)}
        >
          <option value="new">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Popular</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {allItems.map((product) => (
          <ProductCard key={product._id} product={product} onAdd={onAdd} />
        ))}
      </div>
      <Pagination
        hasNext={Boolean(products.hasNextPage)}
        loading={products.isFetchingNextPage}
        onNext={() => products.fetchNextPage()}
      />
    </div>
  );
}
