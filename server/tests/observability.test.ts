import request from "supertest";

import { createApp } from "../src/app.js";

describe("observability", () => {
  const app = createApp();

  it("exposes Prometheus metrics at /metrics", async () => {
    const res = await request(app).get("/metrics");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/plain");
    expect(res.text).toContain("ecommerce_http_requests_total");
    expect(res.text).toContain("ecommerce_http_request_duration_seconds");
  });

  it("propagates requestId into error responses", async () => {
    const requestId = "req-observability-123";
    const res = await request(app)
      .get("/api/route-that-does-not-exist")
      .set("x-request-id", requestId);

    expect(res.status).toBe(404);
    expect(res.headers["x-request-id"]).toBe(requestId);
    expect(res.body?.requestId).toBe(requestId);
    expect(res.body?.error).toBe("NOT_FOUND");
  });
});
