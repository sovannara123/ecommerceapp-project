import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const wishlistAddSchema = z.object({
  productId: objectIdSchema,
});

export const wishlistRemoveParamSchema = z.object({
  id: objectIdSchema,
});
