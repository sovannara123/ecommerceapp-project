import { couponRepo } from "../repositories/couponRepo.js";
import { orderRepo } from "../repositories/orderRepo.js";

function ensureCouponValid(coupon: any, amount: number) {
  if (!coupon) {
    throw Object.assign(new Error("Coupon not found"), {
      statusCode: 404,
      code: "COUPON_NOT_FOUND",
    });
  }
  if (!coupon.isActive) {
    throw Object.assign(new Error("Coupon is inactive"), {
      statusCode: 400,
      code: "COUPON_INACTIVE",
    });
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    throw Object.assign(new Error("Coupon has expired"), {
      statusCode: 400,
      code: "COUPON_EXPIRED",
    });
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw Object.assign(new Error("Coupon usage limit reached"), {
      statusCode: 400,
      code: "COUPON_USAGE_LIMIT",
    });
  }
  if (amount < coupon.minOrderAmount) {
    throw Object.assign(new Error("Order does not meet minimum amount"), {
      statusCode: 400,
      code: "COUPON_MIN_ORDER",
    });
  }
}

function getValidCoupon(coupon: any, amount: number) {
  ensureCouponValid(coupon, amount);
  return coupon as NonNullable<typeof coupon>;
}

function computeDiscount(coupon: any, total: number) {
  let discount = 0;
  if (coupon.type === "percentage") {
    discount = (total * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }

  if (coupon.maxDiscount > 0) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  discount = Math.min(discount, total);
  return Number(discount.toFixed(2));
}

export const couponService = {
  async validate(input: { code: string; cartTotal: number }) {
    const coupon = getValidCoupon(
      await couponRepo.findByCode(input.code),
      input.cartTotal,
    );

    const discountAmount = computeDiscount(coupon, input.cartTotal);
    return {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
      cartTotal: input.cartTotal,
      finalTotal: Number((input.cartTotal - discountAmount).toFixed(2)),
    };
  },

  async apply(input: { userId: string; code: string; orderId: string }) {
    const order = await orderRepo.getForUser(input.userId, input.orderId);
    if (!order) {
      throw Object.assign(new Error("Order not found"), {
        statusCode: 404,
        code: "ORDER_NOT_FOUND",
      });
    }

    const coupon = getValidCoupon(
      await couponRepo.findByCode(input.code),
      order.total,
    );

    const discountAmount = computeDiscount(coupon, order.total);
    const finalTotal = Number((order.total - discountAmount).toFixed(2));

    await orderRepo.update(input.orderId, {
      couponCode: coupon.code,
      couponDiscount: discountAmount,
      totalAfterDiscount: finalTotal,
      couponAppliedAt: new Date(),
    });

    await couponRepo.incrementUsedCount(String(coupon._id));

    const updated = await orderRepo.getForUser(input.userId, input.orderId);
    return {
      order: updated,
      discountAmount,
      finalTotal,
      code: coupon.code,
    };
  },
};
