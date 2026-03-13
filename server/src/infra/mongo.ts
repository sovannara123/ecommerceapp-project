import mongoose from "mongoose";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

export async function connectMongo() {
  mongoose.set("strictQuery", true);
  const maxRetries = 10;
  let attempt = 0;
  while (true) {
    try {
      await mongoose.connect(config.mongoUri);
      // Wait until primary is available
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("Mongo database handle unavailable after connect");
      }
      const admin = db.admin();
      const info = await admin.command({ isMaster: 1 });
      if (info.ismaster || info.isWritablePrimary) {
        break;
      }
      throw new Error("Mongo not primary yet");
    } catch (err) {
      attempt += 1;
      if (attempt >= maxRetries) {
        throw err;
      }
      logger.warn(`Mongo connect retry ${attempt}/${maxRetries}...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // indexes are created on model init; keep autoIndex enabled in dev
  logger.info("Mongo connected");
}
