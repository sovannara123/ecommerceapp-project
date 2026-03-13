import { z } from "zod";
import { PAYMENT_PROVIDER, PAYWAY_PAYMENT_OPTION } from "@/entities/payment/constants";

export const checkoutSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  line1: z.string().min(2),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().optional(),
  shippingFee: z.coerce.number().min(0).default(0),
  paymentProvider: z.enum([PAYMENT_PROVIDER.payway, PAYMENT_PROVIDER.stripe]).default(PAYMENT_PROVIDER.payway),
  paymentOption: z.string().optional().default(PAYWAY_PAYMENT_OPTION.abaDeeplink)
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
