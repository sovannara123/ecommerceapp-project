import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/unwrap";
import type {
  CouponApplyResponse,
  CouponValidationResponse,
} from "@/entities/coupon/types";

export const couponApi = {
  async validateCoupon(code: string, cartTotal: number) {
    const res = await apiClient.post("/coupons/validate", { code, cartTotal });
    return unwrap<CouponValidationResponse>(res);
  },
  async applyCoupon(code: string, orderId: string) {
    const res = await apiClient.post("/coupons/apply", { code, orderId });
    return unwrap<CouponApplyResponse>(res);
  },
};
