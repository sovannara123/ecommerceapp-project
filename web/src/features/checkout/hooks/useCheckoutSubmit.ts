"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { normalizeApiError } from "@/shared/api/error";
import { orderApi } from "@/shared/api/orderApi";
import { paymentApi } from "@/shared/api/paymentApi";
import { PAYMENT_PROVIDER } from "@/entities/payment/constants";
import type { CheckoutFormValues } from "@/features/checkout/components/checkout-types";

type UseCheckoutSubmitArgs = {
  form: UseFormReturn<CheckoutFormValues>;
};

export function useCheckoutSubmit({ form }: UseCheckoutSubmitArgs) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const order = await orderApi.create({
        address: {
          fullName: values.fullName,
          phone: values.phone,
          line1: values.line1,
          city: values.city,
          province: values.province,
          postalCode: values.postalCode || ""
        },
        shippingFee: values.shippingFee,
        paymentProvider: values.paymentProvider,
        paymentOption: values.paymentOption
      });

      if (values.paymentProvider === PAYMENT_PROVIDER.stripe) {
        const stripe = await paymentApi.createStripeIntent({ orderId: order._id });
        toast.success("Stripe intent created");
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`stripe_cs_${order._id}`, stripe.clientSecret);
        }
        router.push(`/orders/${order._id}/confirmation?provider=${PAYMENT_PROVIDER.stripe}`);
        return;
      }

      const payway = await paymentApi.createPayway({ orderId: order._id, paymentOption: values.paymentOption });
      if (payway.deeplink) {
        window.location.href = payway.deeplink;
        return;
      }
      router.push(`/orders/${order._id}/confirmation?provider=${PAYMENT_PROVIDER.payway}&tranId=${payway.tranId}`);
    } catch (error) {
      const normalized = normalizeApiError(error);
      form.setError("root", { message: normalized.message });
      toast.error(normalized.message);
    } finally {
      setSubmitting(false);
    }
  });

  return { submitting, onSubmit };
}
