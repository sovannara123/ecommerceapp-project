import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/unwrap";
import type { Category, Product, ProductListQuery, ProductListResponse } from "@/entities/product/types";

export const catalogApi = {
  async listProducts(query: ProductListQuery) {
    const res = await apiClient.get("/catalog/products", { params: query });
    return unwrap<ProductListResponse>(res);
  },
  async getProduct(id: string) {
    const res = await apiClient.get(`/catalog/products/${id}`);
    return unwrap<Product>(res);
  },
  async listCategories() {
    const res = await apiClient.get("/catalog/categories");
    return unwrap<Category[]>(res);
  }
};
