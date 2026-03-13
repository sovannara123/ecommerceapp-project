import { z } from "zod";
import { objectIdSchema } from "./common.js";
import { ORDER_STATUS, PAYMENT_PROVIDER, PAYWAY_PAYMENT_OPTION } from "../constants/order.js";

function isValidPhone(value: string) {
  const normalized = value.replace(/[\s()-]/g, "");
  return /^(\+?[1-9]\d{7,14}|0\d{7,14})$/.test(normalized);
}

export const addressSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(8).max(30).refine(isValidPhone, "Invalid phone number format"),
  line1: z.string().min(2).max(200),
  city: z.string().min(2).max(80),
  province: z.string().min(2).max(80),
  postalCode: z.string().max(20).optional().default(""),
});

export const createOrderSchema = z.object({
  address: addressSchema,
  currency: z.enum(["USD","KHR"]).optional().default("USD"),
  paymentProvider: z.enum([PAYMENT_PROVIDER.payway, PAYMENT_PROVIDER.stripe]).optional().default(PAYMENT_PROVIDER.payway),
  paymentOption: z.string().optional().default(PAYWAY_PAYMENT_OPTION.abaDeeplink)
});

export const orderIdParamSchema = z.object({
  id: objectIdSchema,
});

export const orderIdBodySchema = z.object({
  orderId: objectIdSchema,
});

export const adminOrderStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUS.pendingPayment,
    ORDER_STATUS.paid,
    ORDER_STATUS.processing,
    ORDER_STATUS.shipped,
    ORDER_STATUS.delivered,
    ORDER_STATUS.cancelled,
  ]),
});

export const cancelOrderSchema = z.object({
  cancelReason: z.string().trim().min(1).max(500).optional().default(""),
});

export const returnOrderSchema = z.object({
  returnReason: z.string().trim().min(1).max(500),
});
