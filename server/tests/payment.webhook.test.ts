import { jest } from "@jest/globals";

import { paymentController, paymentControllerDeps } from "../src/controllers/paymentController.js";
import { paymentService } from "../src/services/paymentService.js";
import { PaymentWebhookLog } from "../src/models/PaymentWebhookLog.js";
import { config } from "../src/config.js";
import { invoke } from "./helpers/httpMock.js";

function withHeaders(headers: Record<string, string>) {
  return (name: string) => headers[name.toLowerCase()] || headers[name] || "";
}

describe("payment webhooks", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    config.payway.webhookSecret = "";
    config.payway.webhookIdempotencyTtlSec = 86_400;
  });

  it("returns standardized 401 for invalid PayWay signature", async () => {
    config.payway.webhookSecret = "expected-secret";

    const res = await invoke(paymentController.paywayPushback, {
      body: { tran_id: "tran12345" },
      header: withHeaders({ "x-payway-signature": "wrong-secret" }),
    } as any);

    expect(res.statusCode).toBe(401);
    expect(res.body?.error).toBe("INVALID_SIGNATURE");
    expect(res.body?.requestId).toBe("test-request-id");
  });

  it("ignores duplicate PayWay pushbacks when idempotency key already exists", async () => {
    config.payway.webhookSecret = "expected-secret";
    const ensureSpy = jest.spyOn(paymentControllerDeps, "ensureOnce").mockResolvedValue(false);
    const serviceSpy = jest.spyOn(paymentService, "handlePaywayPushback");

    const res = await invoke(paymentController.paywayPushback, {
      body: { tran_id: "tran12345" },
      header: withHeaders({ "x-payway-signature": "expected-secret" }),
      log: { info: jest.fn() },
    } as any);

    expect(res.statusCode).toBe(200);
    expect(res.body?.data?.note).toBe("duplicate pushback ignored");
    expect(ensureSpy).toHaveBeenCalledWith("payway:tran:tran12345", 86_400);
    expect(serviceSpy).not.toHaveBeenCalled();
  });

  it("processes PayWay pushback once and logs the webhook payload", async () => {
    config.payway.webhookSecret = "expected-secret";
    config.payway.webhookIdempotencyTtlSec = 120;

    jest.spyOn(paymentControllerDeps, "ensureOnce").mockResolvedValue(true);
    jest.spyOn(paymentService, "handlePaywayPushback").mockResolvedValue({ ok: true, check: { status: "paid" } } as any);
    const logSpy = jest.spyOn(PaymentWebhookLog, "create").mockResolvedValue({} as any);

    const res = await invoke(paymentController.paywayPushback, {
      body: { tran_id: "tran99999" },
      header: withHeaders({ "x-payway-signature": "expected-secret" }),
      log: { info: jest.fn() },
      ip: "127.0.0.1",
    } as any);

    expect(res.statusCode).toBe(200);
    expect(res.body?.data?.ok).toBe(true);
    expect(logSpy).toHaveBeenCalledWith({
      provider: "payway",
      event: "pushback",
      signature: "expected-secret",
      payload: { tran_id: "tran99999" },
    });
    expect(paymentControllerDeps.ensureOnce).toHaveBeenCalledWith("payway:tran:tran99999", 120);
  });

  it("returns 503 when idempotency store is unavailable", async () => {
    config.payway.webhookSecret = "expected-secret";
    jest.spyOn(paymentControllerDeps, "ensureOnce").mockRejectedValue(
      Object.assign(new Error("Idempotency store unavailable"), { statusCode: 503, code: "IDEMPOTENCY_STORE_UNAVAILABLE" }),
    );

    const res = await invoke(paymentController.paywayPushback, {
      body: { tran_id: "tran12345" },
      header: withHeaders({ "x-payway-signature": "expected-secret" }),
      log: { info: jest.fn() },
    } as any);

    expect(res.statusCode).toBe(503);
    expect(res.body?.error).toBe("IDEMPOTENCY_STORE_UNAVAILABLE");
  });
});
