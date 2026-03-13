export type WishlistItem = {
  productId: string;
  name: string;
  images: string[];
  price: number;
  currency: string;
  inStock: boolean;
  stock: number;
  addedAt?: string;
};
