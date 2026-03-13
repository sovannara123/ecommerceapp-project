import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const couponValidateSchema = z.object({
  code: z.string().trim().min(1),
  cartTotal: z.number().min(0),
});

export const couponApplySchema = z.object({
  code: z.string().trim().min(1),
  orderId: objectIdSchema,
});
