import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/unwrap";
import type { WishlistItem } from "@/entities/wishlist/types";

export const wishlistApi = {
  async getWishlist() {
    const res = await apiClient.get("/wishlist");
    return unwrap<WishlistItem[]>(res);
  },
  async addToWishlist(productId: string) {
    const res = await apiClient.post("/wishlist/add", { productId });
    return unwrap<WishlistItem[]>(res);
  },
  async removeFromWishlist(productId: string) {
    const res = await apiClient.delete(`/wishlist/remove/${productId}`);
    return unwrap<WishlistItem[]>(res);
  },
};
