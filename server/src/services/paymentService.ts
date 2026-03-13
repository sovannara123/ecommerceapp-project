import mongoose from "mongoose";
import crypto from "node:crypto";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { PayWayProvider } from "./paymentProviders/PayWayProvider.js";
import { StripeProvider } from "./paymentProviders/StripeProvider.js";
import { config } from "../config.js";
import Stripe from "stripe";
import { ensureOnce } from "../utils/idempotency.js";
import { ORDER_STATUS } from "../constants/order.js";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2023-10-16";
export const paymentServiceDeps = {
  ensureOnce,
};

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  const firstname = parts[0] ?? "Customer";
  const lastname = parts.slice(1).join(" ") || " ";
  return { firstname, lastname };
}

function itemsToPayWayBase64(order: any) {
  // PayWay expects base64 of JSON array of {name, quantity, price}
  const arr = order.items.map((it: any) => ({
    name: it.title,
    quantity: String(it.qty),
    price: String(it.unitPrice.toFixed(2)),
  }));
  return Buffer.from(JSON.stringify(arr), "utf-8").toString("base64");
}

async function resolvePaywayCustomerEmail(userId: mongoose.Types.ObjectId) {
  const user = await User.findById(userId).select({ email: 1 }).exec();
  const email = user?.email || config.payway.customerEmailFallback;
  if (!email) {
    throw Object.assign(new Error("PayWay customer email unavailable"), {
      statusCode: 500,
      code: "PAYWAY_CUSTOMER_EMAIL_UNAVAILABLE",
    });
  }
  return email;
}

export const paymentService = {
  async createStripePaymentIntent(input: { orderId: string; requester: { userId: string; role: "customer" | "admin" } }) {
    if (!config.stripe.secretKey) throw Object.assign(new Error("Stripe not configured"), { statusCode: 400, code: "STRIPE_DISABLED" });
    const orderFilter =
      input.requester.role === "admin"
        ? { _id: new mongoose.Types.ObjectId(input.orderId) }
        : { _id: new mongoose.Types.ObjectId(input.orderId), userId: new mongoose.Types.ObjectId(input.requester.userId) };

    const order = await Order.findOne(orderFilter).exec();
    if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404, code: "ORDER_NOT_FOUND" });
    if (order.status !== ORDER_STATUS.pendingPayment) throw Object.assign(new Error("Order not payable"), { statusCode: 400, code: "ORDER_NOT_PAYABLE" });

    const provider = new StripeProvider();
    if (order.stripePaymentIntentId) {
      try {
        const existingIntent = await provider.getPaymentIntent(order.stripePaymentIntentId);
        if (existingIntent.client_secret && existingIntent.status !== "canceled") {
          return { provider: "stripe", clientSecret: existingIntent.client_secret } as const;
        }
      } catch {
        // If retrieve fails, create a new intent below.
      }
    }

    const created = await provider.createPayment({
      orderId: String(order._id),
      amount: order.total,
      currency: order.currency.toLowerCase(),
      idempotencyKey: `stripe:intent:${order._id}`,
    });
    order.stripePaymentIntentId = created.paymentIntentId;
    await order.save();
    return { provider: "stripe", clientSecret: created.clientSecret } as const;
  },

  async handleStripeWebhook(rawBody: Buffer, sig: string | undefined) {
    if (!config.stripe.webhookSecret || !config.stripe.secretKey) throw new Error("Stripe not configured");
    const stripe = new Stripe(config.stripe.secretKey, { apiVersion: STRIPE_API_VERSION });
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig || "", config.stripe.webhookSecret);
    } catch (err: any) {
      throw Object.assign(new Error("Invalid stripe signature"), { statusCode: 400, code: "INVALID_SIGNATURE", details: err?.message });
    }

    const once = await paymentServiceDeps.ensureOnce(`stripe:event:${event.id}`, config.stripe.webhookIdempotencyTtlSec);
    if (!once) {
      return { received: true, duplicate: true };
    }

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        await Order.updateOne(
          { _id: orderId, status: ORDER_STATUS.pendingPayment },
          { $set: { status: ORDER_STATUS.paid } },
        ).exec();
      }
    }
    return { received: true };
  },

  async createPaywayPayment(input: {
    orderId: string;
    paymentOption: string;
    requester: { userId: string; role: "customer" | "admin" };
  }) {
    const orderFilter =
      input.requester.role === "admin"
        ? { _id: new mongoose.Types.ObjectId(input.orderId) }
        : {
            _id: new mongoose.Types.ObjectId(input.orderId),
            userId: new mongoose.Types.ObjectId(input.requester.userId),
          };

    const order = await Order.findOne(orderFilter).exec();
    if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404, code: "ORDER_NOT_FOUND" });
    if (order.status !== ORDER_STATUS.pendingPayment) throw Object.assign(new Error("Order not payable"), { statusCode: 400, code: "ORDER_NOT_PAYABLE" });

    const tranId = order.paywayTranId || crypto.randomUUID().replace(/-/g, "").slice(0, 20);
    order.paywayTranId = tranId;
    await order.save();

    const provider = new PayWayProvider();

    const { firstname, lastname } = splitName(order.address.fullName);
    const itemsBase64 = itemsToPayWayBase64(order);
    const customerEmail = await resolvePaywayCustomerEmail(order.userId);

    const result = await provider.createPayment({
      orderId: String(order._id),
      tranId,
      amount: order.total,
      currency: order.currency,
      customer: {
        firstname,
        lastname,
        email: customerEmail,
        phone: order.address.phone,
      },
      itemsBase64,
      paymentOption: input.paymentOption,
      returnUrlBase64: config.payway.returnUrlBase64,
      cancelUrl: config.payway.cancelUrl,
      continueSuccessUrl: config.payway.continueSuccessUrl,
      returnParams: String(order._id),
    });

    return result;
  },

  async handlePaywayPushback(tranId: string) {
    const order = await Order.findOne({ paywayTranId: tranId }).exec();
    if (order?.status === ORDER_STATUS.paid) {
      return { ok: true, note: "Order already paid, check skipped" };
    }

    const provider = new PayWayProvider();
    const check = await provider.verifyAndFinalizePayment({ tranId });
    if (!order) return { ok: true, note: "Order not found for tranId, but pushback accepted", check };

    if (check.status === ORDER_STATUS.paid && order.status === ORDER_STATUS.pendingPayment) {
      order.status = ORDER_STATUS.paid;
      order.paywayApv = check.apv || "";
      await order.save();
    }

    return { ok: true, check };
  }
};
