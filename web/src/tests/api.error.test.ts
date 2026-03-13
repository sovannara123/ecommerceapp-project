import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import { normalizeApiError } from "@/shared/api/error";

describe("normalizeApiError", () => {
  it("maps backend error envelope", () => {
    const error = new AxiosError("bad", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 401,
      statusText: "Unauthorized",
      headers: { "x-request-id": "req-1" },
      config: {} as any,
      data: { success: false, error: "UNAUTHORIZED", message: "Invalid token", requestId: "req-1" }
    });

    const normalized = normalizeApiError(error);
    expect(normalized.code).toBe("UNAUTHORIZED");
    expect(normalized.requestId).toBe("req-1");
  });
});
