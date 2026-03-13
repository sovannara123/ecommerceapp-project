import { jest } from "@jest/globals";
import Stripe from "stripe";

import { paymentService, paymentServiceDeps } from "../src/services/paymentService.js";
import { Order } from "../src/models/Order.js";
import { config } from "../src/config.js";

const stripe = new Stripe("sk_test_123", { apiVersion: "2023-10-16" });

function makeSignature(payload: string, secret: string) {
  return stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
  });
}

describe("paymentService.handleStripeWebhook", () => {
  beforeEach(() => {
    config.stripe.secretKey = "sk_test_123";
    config.stripe.webhookSecret = "whsec_test_123";
    config.stripe.webhookIdempotencyTtlSec = 120;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("handles valid signature and transitions pending orders to paid", async () => {
    const eventPayload = JSON.stringify({
      id: "evt_1",
      object: "event",
      type: "payment_intent.succeeded",
      data: { object: { metadata: { orderId: "64f000000000000000000123" } } },
    });
    const signature = makeSignature(eventPayload, config.stripe.webhookSecret);

    const ensureSpy = jest.spyOn(paymentServiceDeps, "ensureOnce").mockResolvedValue(true);
    const updateSpy = jest.spyOn(Order, "updateOne").mockReturnValue({ exec: async () => ({ modifiedCount: 1 }) } as any);

    const result = await paymentService.handleStripeWebhook(Buffer.from(eventPayload), signature);

    expect(result).toEqual({ received: true });
    expect(ensureSpy).toHaveBeenCalledWith("stripe:event:evt_1", 120);
    expect(updateSpy).toHaveBeenCalledWith(
      { _id: "64f000000000000000000123", status: "pending_payment" },
      { $set: { status: "paid" } },
    );
  });

  it("rejects invalid stripe signature", async () => {
    const payload = JSON.stringify({
      id: "evt_bad",
      object: "event",
      type: "payment_intent.succeeded",
      data: { object: { metadata: { orderId: "64f000000000000000000123" } } },
    });

    await expect(paymentService.handleStripeWebhook(Buffer.from(payload), "bad-sig")).rejects.toMatchObject({
      code: "INVALID_SIGNATURE",
      statusCode: 400,
    });
  });

  it("ignores duplicate stripe events", async () => {
    const eventPayload = JSON.stringify({
      id: "evt_dup",
      object: "event",
      type: "payment_intent.succeeded",
      data: { object: { metadata: { orderId: "64f000000000000000000123" } } },
    });
    const signature = makeSignature(eventPayload, config.stripe.webhookSecret);

    jest.spyOn(paymentServiceDeps, "ensureOnce").mockResolvedValue(false);
    const updateSpy = jest.spyOn(Order, "updateOne").mockReturnValue({ exec: async () => ({ modifiedCount: 1 }) } as any);

    const result = await paymentService.handleStripeWebhook(Buffer.from(eventPayload), signature);

    expect(result).toEqual({ received: true, duplicate: true });
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("does not transition status for unrelated Stripe events", async () => {
    const eventPayload = JSON.stringify({
      id: "evt_unrelated",
      object: "event",
      type: "payment_intent.created",
      data: { object: { metadata: { orderId: "64f000000000000000000123" } } },
    });
    const signature = makeSignature(eventPayload, config.stripe.webhookSecret);

    jest.spyOn(paymentServiceDeps, "ensureOnce").mockResolvedValue(true);
    const updateSpy = jest.spyOn(Order, "updateOne").mockReturnValue({ exec: async () => ({ modifiedCount: 1 }) } as any);

    const result = await paymentService.handleStripeWebhook(Buffer.from(eventPayload), signature);

    expect(result).toEqual({ received: true });
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
