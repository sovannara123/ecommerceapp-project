import { Request, Response } from "express";
import crypto from "node:crypto";
import { ok } from "../utils/apiResponse.js";
import { paymentService } from "../services/paymentService.js";
import { z } from "zod";
import { orderIdBodySchema } from "../validators/order.js";
import { config } from "../config.js";
import { ensureOnce } from "../utils/idempotency.js";
import { PaymentWebhookLog } from "../models/PaymentWebhookLog.js";
import { fail } from "../utils/apiResponse.js";

export const paymentControllerDeps = {
  ensureOnce,
};

const createPaywaySchema = orderIdBodySchema.extend({
  paymentOption: z.string().optional().default("abapay_deeplink"),
});

const paywayPushbackSchema = z.object({
  tran_id: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/).optional(),
  tranId: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/).optional(),
}).superRefine((value, ctx) => {
  if (!value.tran_id && !value.tranId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "tran_id required",
      path: ["tran_id"],
    });
  }
});

export const paymentController = {
  async createPayway(req: Request, res: Response) {
    const body = createPaywaySchema.parse(req.body);
    const result = await paymentService.createPaywayPayment({
      orderId: body.orderId,
      paymentOption: body.paymentOption,
      requester: {
        userId: req.user!.sub,
        role: req.user!.role,
      },
    });
    res.json(ok(result));
  },

  async paywayPushback(req: Request, res: Response) {
    // --- PayWay HMAC Webhook Verification ---
    const signature = req.header("x-payway-signature") || "";
    const timestamp = req.header("x-payway-timestamp") || "";

    // 1. Reject if secret not configured
    if (!config.payway.webhookSecret) {
      console.error("[PayWay Webhook] PAYWAY_WEBHOOK_SECRET not configured");
      return res.status(500).json(fail("CONFIG_ERROR", "Webhook not configured", req.requestId));
    }

    // 2. Reject if signature or timestamp missing
    if (!signature || !timestamp) {
      return res.status(401).json(fail("INVALID_SIGNATURE", "Missing signature or timestamp", req.requestId));
    }

    // 3. Replay protection — reject timestamps older than 5 minutes
    const timestampMs = parseInt(timestamp, 10);
    const age = Math.abs(Date.now() - timestampMs);
    if (isNaN(timestampMs) || age > 5 * 60 * 1000) {
      return res.status(401).json(fail("INVALID_SIGNATURE", "Webhook timestamp expired or invalid", req.requestId));
    }

    // 4. Compute expected HMAC-SHA256 over "timestamp.rawBody"
    const rawBody = req.rawBody;
    if (!rawBody) {
      console.error("[PayWay Webhook] Raw body not captured — check middleware ordering");
      return res.status(500).json(fail("CONFIG_ERROR", "Raw body not available", req.requestId));
    }

    const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
    const expectedSignature = crypto
      .createHmac("sha256", config.payway.webhookSecret)
      .update(signedPayload)
      .digest("hex");

    // 5. Constant-time comparison
    const sigBuffer = Buffer.from(signature, "hex");
    const expBuffer = Buffer.from(expectedSignature, "hex");

    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      return res.status(401).json(fail("INVALID_SIGNATURE", "Invalid webhook signature", req.requestId));
    }

    // --- Signature valid, continue processing ---
    let jsonBody: unknown;
    try {
      jsonBody = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json(fail("INVALID_BODY", "Invalid JSON body", req.requestId));
    }
    const body = paywayPushbackSchema.parse(jsonBody);
    const tranId = body.tran_id ?? body.tranId!;

    const once = await paymentControllerDeps.ensureOnce(`payway:tran:${tranId}`, config.payway.webhookIdempotencyTtlSec);
    if (!once) {
      return res.json(ok({ ok: true, note: "duplicate pushback ignored" }));
    }

    req.log?.info({ ip: req.ip, tranId }, "PayWay pushback received");
    const out = await paymentService.handlePaywayPushback(tranId);
    await PaymentWebhookLog.create({ provider: "payway", event: "pushback", signature, payload: body });
    res.json(ok(out));
  },

  async createStripe(req: Request, res: Response) {
    const body = orderIdBodySchema.parse(req.body);
    const result = await paymentService.createStripePaymentIntent({
      orderId: body.orderId,
      requester: { userId: req.user!.sub, role: req.user!.role },
    });
    res.json(ok(result));
  },

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.header("stripe-signature");
    const result = await paymentService.handleStripeWebhook(req.body as Buffer, sig || "");
    await PaymentWebhookLog.create({ provider: "stripe", event: "webhook", signature: sig || "", payload: req.body?.toString?.() || {} });
    res.json(result);
  }
};
