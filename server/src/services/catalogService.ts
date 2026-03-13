import { categoryRepo } from "../repositories/categoryRepo.js";
import { productRepo } from "../repositories/productRepo.js";

export const catalogService = {
  listCategories() {
    return categoryRepo.list();
  },
  createCategory(data: { name: string; slug: string }) {
    return categoryRepo.create(data);
  },
  updateCategory(id: string, data: any) {
    return categoryRepo.update(id, data);
  },
  removeCategory(id: string) {
    return categoryRepo.remove(id);
  },

  listProducts(params: any) {
    return productRepo.list(params);
  },
  getProduct(id: string) {
    return productRepo.get(id);
  },
  listFeaturedProducts() {
    return productRepo.listFeatured(20);
  },
  listDealsProducts() {
    return productRepo.listDeals(20);
  },
  listProductReviews(productId: string, page: number, limit: number) {
    return productRepo.listReviewsForProduct(productId, page, limit);
  },
  createProduct(data: any) {
    return productRepo.create(data);
  },
  updateProduct(id: string, data: any) {
    return productRepo.update(id, data);
  },
  removeProduct(id: string) {
    return productRepo.remove(id);
  },
};
