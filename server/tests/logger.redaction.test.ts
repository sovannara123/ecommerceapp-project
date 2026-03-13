import pino from "pino";
import { Writable } from "stream";

import { loggerOptions } from "../src/utils/logger.js";

describe("logger redaction", () => {
  it("redacts sensitive headers and token fields", async () => {
    const chunks: string[] = [];
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(String(chunk));
        callback();
      },
    });

    const testLogger = pino(loggerOptions, stream);
    testLogger.info({
      req: {
        headers: {
          authorization: "Bearer secret-token",
          cookie: "session=abc",
          "x-payway-signature": "payway-secret",
          "stripe-signature": "stripe-secret",
        },
        body: {
          password: "P@ssw0rd!",
          refreshToken: "refresh-secret",
          accessToken: "access-secret",
        },
      },
      res: {
        body: {
          accessToken: "response-access-secret",
          refreshToken: "response-refresh-secret",
        },
      },
    }, "redaction-check");

    await new Promise((resolve) => setTimeout(resolve, 0));
    const output = chunks.join("");

    expect(output).not.toContain("secret-token");
    expect(output).not.toContain("session=abc");
    expect(output).not.toContain("payway-secret");
    expect(output).not.toContain("stripe-secret");
    expect(output).not.toContain("P@ssw0rd!");
    expect(output).not.toContain("refresh-secret");
    expect(output).not.toContain("access-secret");
    expect(output).not.toContain("response-access-secret");
    expect(output).not.toContain("response-refresh-secret");
    expect(output).toContain("[Redacted]");
  });
});
