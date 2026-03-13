"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/shared/api/catalogApi";
import type { ProductListQuery } from "@/entities/product/types";

export function useProducts(query: ProductListQuery) {
  return useInfiniteQuery({
    queryKey: ["products", query],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => catalogApi.listProducts({ ...query, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => catalogApi.getProduct(id),
    enabled: !!id
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: catalogApi.listCategories
  });
}
