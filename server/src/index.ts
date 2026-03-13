import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app.js";
import mongoose from "mongoose";
import { connectMongo } from "./infra/mongo.js";
import { connectRedis, disconnectRedis } from "./infra/redis.js";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { cancelExpiredReservations } from "./jobs/inventoryExpiryJob.js";

let server: ReturnType<ReturnType<typeof createApp>["listen"]> | undefined;
let shuttingDown = false;

async function gracefulShutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Shutdown initiated");

  const forceExitTimer = setTimeout(() => {
    logger.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  try {
    await new Promise<void>((resolve, reject) => {
      if (!server) return resolve();
      server.close((err) => (err ? reject(err) : resolve()));
    });
    logger.info("HTTP server closed");
  } catch (err) {
    logger.error({ err }, "Error while closing HTTP server");
  }

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info("Mongo disconnected");
    }
  } catch (err) {
    logger.error({ err }, "Error while disconnecting Mongo");
  }

  try {
    await disconnectRedis();
  } catch (err) {
    logger.error({ err }, "Error while disconnecting Redis");
  }

  clearTimeout(forceExitTimer);
  logger.info("Shutdown complete");
  process.exit(0);
}

async function main() {
  await connectMongo();
  await connectRedis();

  const app = createApp();
  const port = config.port;

  server = app.listen(port, () => {
    logger.info({ port }, "Server listening");

    // Run inventory cleanup every 5 minutes
    const INVENTORY_CLEANUP_INTERVAL = 5 * 60 * 1000;
    setInterval(() => {
      cancelExpiredReservations().catch((err) =>
        console.error("[InventoryExpiry] Scheduled run failed:", err)
      );
    }, INVENTORY_CLEANUP_INTERVAL);

    // Also run once on startup (catches orders that expired while server was down)
    cancelExpiredReservations().catch((err) =>
      console.error("[InventoryExpiry] Startup run failed:", err)
    );
  });
}

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});
process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

main().catch((err) => {
  logger.error({ err }, "Server failed to start");
  process.exit(1);
});
