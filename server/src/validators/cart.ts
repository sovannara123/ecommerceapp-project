import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const cartAddSchema = z.object({
  productId: objectIdSchema,
  qty: z.number().int().min(1).max(99)
});

export const cartUpdateSchema = z.object({
  productId: objectIdSchema,
  qty: z.number().int().min(1).max(99)
});

export const cartRemoveSchema = z.object({
  productId: objectIdSchema,
});
