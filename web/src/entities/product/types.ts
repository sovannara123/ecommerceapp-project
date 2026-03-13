export type Currency = "USD" | "KHR";

export type Product = {
  _id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  currency: Currency;
  categoryId: string;
  stock: number;
  tags: string[];
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductSort =
  | "new"
  | "price_asc"
  | "price_desc"
  | "popular"
  | "rating";

export type ProductListQuery = {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  brand?: string;
  sort?: ProductSort;
  limit?: number;
  cursor?: string;
};

export type ProductListResponse = {
  items: Product[];
  nextCursor: string | null;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
};
