import { config } from "../src/config.js";
import { PaymentWebhookLog } from "../src/models/PaymentWebhookLog.js";

describe("PaymentWebhookLog retention", () => {
  it("configures TTL index from environment retention days", () => {
    const indexes = PaymentWebhookLog.schema.indexes();
    const ttlIndex = indexes.find(([fields, options]) =>
      (fields as any).createdAt === 1 && Number((options as any).expireAfterSeconds) > 0,
    );

    expect(ttlIndex).toBeDefined();
    expect((ttlIndex?.[1] as any).expireAfterSeconds).toBe(config.paymentWebhookLogRetentionDays * 86_400);
  });
});
