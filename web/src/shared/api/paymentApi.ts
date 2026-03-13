import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/unwrap";
import type { CreatePaywayRequest, CreateStripeIntentRequest, PaywayCreateResponse, StripeCreateResponse } from "@/entities/payment/types";

export const paymentApi = {
  async createPayway(payload: CreatePaywayRequest) {
    const res = await apiClient.post("/payments/payway/create", payload);
    return unwrap<PaywayCreateResponse>(res);
  },
  async createStripeIntent(payload: CreateStripeIntentRequest) {
    const res = await apiClient.post("/payments/stripe/create-intent", payload);
    return unwrap<StripeCreateResponse>(res);
  }
};
