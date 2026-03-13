import type { Order } from "@/entities/order/types";

export type CouponType = "percentage" | "fixed";

export type CouponValidationRequest = {
  code: string;
  cartTotal: number;
};

export type CouponValidationResponse = {
  code: string;
  type: CouponType;
  value: number;
  discountAmount: number;
  cartTotal: number;
  finalTotal: number;
};

export type CouponApplyRequest = {
  code: string;
  orderId: string;
};

export type CouponApplyResponse = {
  order: Order;
  discountAmount: number;
  finalTotal: number;
  code: string;
};
