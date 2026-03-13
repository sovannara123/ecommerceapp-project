import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { pinoHttp } from "pino-http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { nanoid } from "nanoid";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { requestId } from "./middlewares/requestId.js";
import { apiRouter } from "./routes/index.js";
import { config } from "./config.js";
import mongoose from "mongoose";
import { isRedisReady } from "./infra/redis.js";
import { logger } from "./utils/logger.js";
import {
  getMetrics,
  getMetricsContentType,
  metricsMiddleware,
} from "./infra/metrics.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerSpec = JSON.parse(
  readFileSync(path.join(__dirname, "docs", "openapi.json"), "utf-8"),
);

function isLocalDevOrigin(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

export function createApp() {
  const app = express();
  const allowedOrigins = config.corsOrigins;

  const corsOptions: CorsOptions = {
    origin(origin, callback) {
      // Allow non-browser clients (curl/postman) with no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (config.nodeEnv !== "production" && isLocalDevOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-device-id", "x-request-id"],
    optionsSuccessStatus: 204,
  };

  app.use(
    pinoHttp({
      logger,
      genReqId(req, res) {
        const headerId = req.headers["x-request-id"];
        const id = Array.isArray(headerId)
          ? headerId[0]
          : headerId || nanoid(10);
        res.setHeader("x-request-id", id);
        return id;
      },
      customProps(req) {
        const requestId =
          typeof (req as any).id === "string" ? (req as any).id : req.requestId;
        return { requestId };
      },
    }),
  );
  app.use(requestId());
  app.use(helmet());
  app.use(compression());
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  // Stripe webhook needs raw body for signature verification
  app.use("/api/payments/stripe/webhook", bodyParser.raw({ type: "*/*" }));

  // Keep webhook payloads unparsed globally; they are handled per-route as raw.
  const jsonParser = express.json({ limit: "1mb" });
  app.use((req, res, next) => {
    if (
      req.path.startsWith("/api/payments/webhook") ||
      req.path === "/api/payments/payway/pushback"
    ) {
      return next();
    }
    return jsonParser(req, res, next);
  });
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(metricsMiddleware);

  app.get("/health", async (_req, res) => {
    const mongoOk = mongoose.connection.readyState === 1;
    const redisOk = isRedisReady();
    const status = mongoOk && redisOk ? 200 : 503;
    res.status(status).json({ ok: mongoOk && redisOk, mongo: mongoOk, redis: redisOk });
  });

  app.get("/metrics", async (_req, res, next) => {
    try {
      res.setHeader("Content-Type", getMetricsContentType());
      res.status(200).send(await getMetrics());
    } catch (err) {
      next(err);
    }
  });

  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api", apiRouter);

  app.use(notFound());
  app.use(errorHandler());

  return app;
}
