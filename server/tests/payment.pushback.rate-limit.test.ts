import { createPaywayPushbackRateLimiter } from "../src/routes/modules/paymentRoutes.js";

describe("payway pushback rate limiter", () => {
  it("returns 429 after 30 requests in a minute", async () => {
    const limiter = createPaywayPushbackRateLimiter();

    async function hitLimiter() {
      return new Promise<number>((resolve, reject) => {
        const req: any = {
          ip: "127.0.0.1",
          app: { get: () => false },
          headers: {},
        };
        const res: any = {
          statusCode: 200,
          headersSent: false,
          writableEnded: false,
          setHeader() {},
          append() {},
          status(code: number) {
            this.statusCode = code;
            return this;
          },
          send() {
            this.writableEnded = true;
            resolve(this.statusCode);
            return this;
          },
          on() {
            return this;
          },
        };

        Promise.resolve(
          limiter(req, res, (err?: unknown) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(res.statusCode);
          }),
        ).catch(reject);
      });
    }

    for (let i = 0; i < 30; i += 1) {
      const status = await hitLimiter();
      expect(status).toBe(200);
    }

    const status = await hitLimiter();
    expect(status).toBe(429);
  });
});
