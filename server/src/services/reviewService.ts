import { reviewRepo } from "../repositories/reviewRepo.js";
import { orderRepo } from "../repositories/orderRepo.js";
import { productRepo } from "../repositories/productRepo.js";

async function recalculateProductRating(productId: string) {
  const stats = await reviewRepo.statsForProduct(productId);
  const averageRating = stats[0]?.averageRating ?? 0;
  const reviewCount = stats[0]?.reviewCount ?? 0;

  await productRepo.update(productId, {
    averageRating,
    reviewCount,
    rating: averageRating,
  });
}

async function userPurchasedProduct(
  userId: string,
  orderId: string,
  productId: string,
) {
  const order = await orderRepo.getForUser(userId, orderId);
  if (!order) return false;

  return order.items.some(
    (item: any) => String(item.productId) === String(productId),
  );
}

export const reviewService = {
  async create(input: {
    userId: string;
    productId: string;
    orderId: string;
    rating: number;
    comment?: string;
    images?: string[];
  }) {
    const product = await productRepo.get(input.productId);
    if (!product) {
      throw Object.assign(new Error("Product not found"), {
        statusCode: 404,
        code: "PRODUCT_NOT_FOUND",
      });
    }

    const purchased = await userPurchasedProduct(
      input.userId,
      input.orderId,
      input.productId,
    );
    if (!purchased) {
      throw Object.assign(new Error("Product not purchased by user"), {
        statusCode: 400,
        code: "REVIEW_NOT_ALLOWED",
      });
    }

    const existing = await reviewRepo.findByUserAndProduct(
      input.userId,
      input.productId,
    );
    if (existing) {
      throw Object.assign(new Error("Review already exists"), {
        statusCode: 409,
        code: "REVIEW_EXISTS",
      });
    }

    const created = await reviewRepo.create(input);
    await recalculateProductRating(input.productId);
    return created;
  },

  async update(input: {
    userId: string;
    reviewId: string;
    data: Partial<{ rating: number; comment: string; images: string[] }>;
  }) {
    const review = await reviewRepo.findByIdForUser(input.reviewId, input.userId);
    if (!review) {
      throw Object.assign(new Error("Review not found"), {
        statusCode: 404,
        code: "REVIEW_NOT_FOUND",
      });
    }

    const updated = await reviewRepo.updateByIdForUser(
      input.reviewId,
      input.userId,
      input.data,
    );
    if (!updated) {
      throw Object.assign(new Error("Review not found"), {
        statusCode: 404,
        code: "REVIEW_NOT_FOUND",
      });
    }

    await recalculateProductRating(String(review.productId));
    return updated;
  },

  async remove(input: { userId: string; reviewId: string }) {
    const review = await reviewRepo.deleteByIdForUser(input.reviewId, input.userId);
    if (!review) {
      throw Object.assign(new Error("Review not found"), {
        statusCode: 404,
        code: "REVIEW_NOT_FOUND",
      });
    }

    await recalculateProductRating(String(review.productId));
    return true;
  },
};
