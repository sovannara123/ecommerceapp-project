export type ProductSort =
  | "new"
  | "price_asc"
  | "price_desc"
  | "popular"
  | "rating";

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  brand?: string;
}
