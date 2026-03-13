import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const reviewCreateSchema = z.object({
  productId: objectIdSchema,
  orderId: objectIdSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().default(""),
  images: z.array(z.string().trim().min(1)).max(10).optional().default([]),
});

export const reviewUpdateSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().max(2000).optional(),
    images: z.array(z.string().trim().min(1)).max(10).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const reviewIdParamSchema = z.object({
  id: objectIdSchema,
});
