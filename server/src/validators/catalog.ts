import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const productCreateSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(5).max(4000),
  images: z.array(z.string().url()).optional().default([]),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  currency: z.enum(["USD","KHR"]).optional().default("USD"),
  categoryId: z.string().min(1),
  stock: z.number().int().min(0),
  isFeatured: z.boolean().optional().default(false),
  tags: z.array(z.string().max(30)).optional().default([])
});

export const productUpdateSchema = productCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(80)
});

export const listProductsSchema = z.object({
  q: z.string().optional(),
  categoryId: objectIdSchema.optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["new","price_asc","price_desc"]).optional().default("new"),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  cursor: z.string().optional(),
});

export const productIdParamSchema = z.object({
  id: objectIdSchema,
});

export const productReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
