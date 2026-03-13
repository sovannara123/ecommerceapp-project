import Stripe from "stripe";
import { PaymentProvider } from "./PaymentProvider.js";
import { config } from "../../config.js";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2023-10-16";

export class StripeProvider implements PaymentProvider {
  stripe = new Stripe(config.stripe.secretKey, { apiVersion: STRIPE_API_VERSION });

  async getPaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async createPayment(input: any) {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(input.amount * 100),
      currency: input.currency.toLowerCase(),
      metadata: { orderId: input.orderId },
      automatic_payment_methods: { enabled: true },
    }, input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined);
    return { provider: "stripe", clientSecret: intent.client_secret!, paymentIntentId: intent.id } as const;
  }
  async verifyAndFinalizePayment(_input: any) {
    return { status: "not_paid" as const };
  }
}
