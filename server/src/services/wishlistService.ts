import { wishlistRepo } from "../repositories/wishlistRepo.js";
import { productRepo } from "../repositories/productRepo.js";

function mapWishlistItem(doc: any) {
  const product = doc.productId;
  if (!product) return null;

  return {
    productId: String(product._id),
    name: product.title,
    images: Array.isArray(product.images) ? product.images : [],
    price: product.price,
    currency: product.currency,
    inStock: (product.stock ?? 0) > 0,
    stock: product.stock,
    addedAt: doc.addedAt,
  };
}

export const wishlistService = {
  async getWishlist(userId: string) {
    const entries = await wishlistRepo.list(userId);
    return entries.map(mapWishlistItem).filter(Boolean);
  },

  async addToWishlist(userId: string, productId: string) {
    const product = await productRepo.get(productId);
    if (!product) {
      throw Object.assign(new Error("Product not found"), {
        statusCode: 404,
        code: "PRODUCT_NOT_FOUND",
      });
    }

    await wishlistRepo.upsert(userId, productId);
    return this.getWishlist(userId);
  },

  async removeFromWishlist(userId: string, productId: string) {
    await wishlistRepo.remove(userId, productId);
    return this.getWishlist(userId);
  },
};
