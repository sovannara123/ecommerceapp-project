import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/unwrap";
import type { Cart, CartAddRequest, CartRemoveRequest, CartUpdateRequest } from "@/entities/cart/types";

export const cartApi = {
  async getCart() {
    const res = await apiClient.get("/cart");
    return unwrap<Cart>(res);
  },
  async addItem(payload: CartAddRequest) {
    const res = await apiClient.post("/cart/add", payload);
    return unwrap<Cart>(res);
  },
  async updateItem(payload: CartUpdateRequest) {
    const res = await apiClient.post("/cart/update", payload);
    return unwrap<Cart>(res);
  },
  async removeItem(payload: CartRemoveRequest) {
    const res = await apiClient.post("/cart/remove", payload);
    return unwrap<Cart>(res);
  },
  async clear() {
    const res = await apiClient.post("/cart/clear");
    return unwrap<Cart>(res);
  }
};
