import express, { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../middlewares/auth.js";
import { paymentController } from "../../controllers/paymentController.js";
import bodyParser from "body-parser";
import { captureRawBody } from "../../middleware/rawBody.js";

export const paymentRouter = Router();

export function createPaywayPushbackRateLimiter() {
  return rateLimit({
    windowMs: 60_000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });
}

const paywayPushbackRateLimiter = createPaywayPushbackRateLimiter();

// Create checkout (requires auth)
paymentRouter.post("/payway/create", requireAuth(), (req, res, next) => paymentController.createPayway(req, res).catch(next));
paymentRouter.post("/stripe/create-intent", requireAuth(), (req, res, next) => paymentController.createStripe(req, res).catch(next));

// Pushback webhook (configured in PayWay merchant profile)
paymentRouter.post(
  "/payway/pushback",
  paywayPushbackRateLimiter,
  express.raw({ type: "application/json" }),
  captureRawBody,
  (req, res, next) => paymentController.paywayPushback(req, res).catch(next)
);

// Stripe webhook requires raw body for signature verification
paymentRouter.post("/stripe/webhook", bodyParser.raw({ type: "*/*" }), (req, res, next) => paymentController.stripeWebhook(req, res).catch(next));
