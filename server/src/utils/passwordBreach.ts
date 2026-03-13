import crypto from "crypto";
import axios from "axios";
import { config } from "../config.js";

function sha1HexUpper(value: string) {
  return crypto.createHash("sha1").update(value, "utf8").digest("hex").toUpperCase();
}

export async function assertPasswordNotBreached(password: string) {
  if (!config.hibp.enabled) return;

  const digest = sha1HexUpper(password);
  const prefix = digest.slice(0, 5);
  const suffix = digest.slice(5);

  try {
    const res = await axios.get(`${config.hibp.apiBaseUrl}/range/${prefix}`, {
      timeout: config.hibp.timeoutMs,
      headers: {
        "Add-Padding": "true",
        "User-Agent": "ecommerce-server/1.0",
      },
      responseType: "text",
    });

    const lines = String(res.data || "").split(/\r?\n/);
    const match = lines.find((line) => line.split(":")[0]?.trim().toUpperCase() === suffix);
    if (match) {
      throw Object.assign(new Error("Password has appeared in a known breach"), {
        statusCode: 400,
        code: "BREACHED_PASSWORD",
      });
    }
  } catch (err) {
    if ((err as any)?.code === "BREACHED_PASSWORD") throw err;
    if (config.hibp.strict) {
      throw Object.assign(new Error("Password breach check unavailable"), {
        statusCode: 503,
        code: "PASSWORD_CHECK_UNAVAILABLE",
      });
    }
  }
}
