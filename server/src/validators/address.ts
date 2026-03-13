import { z } from "zod";
import { objectIdSchema } from "./common.js";

const labelSchema = z.enum(["home", "work", "other"]);

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const addressCreateSchema = z.object({
  label: labelSchema.optional(),
  fullName: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  addressLine1: z.string().trim().min(1),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  postalCode: z.string().trim().min(1),
  country: z.string().trim().min(1).default("KH"),
  isDefault: z.boolean().optional(),
  location: locationSchema.optional(),
});

export const addressUpdateSchema = z
  .object({
    label: labelSchema.optional(),
    fullName: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1).optional(),
    addressLine1: z.string().trim().min(1).optional(),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(1).optional(),
    state: z.string().trim().min(1).optional(),
    postalCode: z.string().trim().min(1).optional(),
    country: z.string().trim().min(1).optional(),
    isDefault: z.boolean().optional(),
    location: locationSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const addressIdParamSchema = z.object({
  id: objectIdSchema,
});

export const addressSetDefaultParamSchema = z.object({
  id: objectIdSchema,
});
