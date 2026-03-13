import pino from "pino";
import { config } from "../config.js";

export const loggerRedactionPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers['x-payway-signature']",
  "req.headers['stripe-signature']",
  "req.headers['x-webhook-signature']",
  "req.body.password",
  "req.body.refreshToken",
  "req.body.accessToken",
  "req.body.token",
  "req.body.signature",
  "res.body.accessToken",
  "res.body.refreshToken",
  "res.headers['set-cookie']",
] as const;

export const loggerOptions: pino.LoggerOptions = {
  level: config.logLevel,
  redact: {
    paths: [...loggerRedactionPaths],
    censor: "[Redacted]",
  },
};

export function createLogger() {
  return pino(loggerOptions);
}

export const logger = createLogger();
