import { jest } from "@jest/globals";
import mongoose from "mongoose";

import { authController } from "../src/controllers/authController.js";
import { authServiceDeps } from "../src/services/authService.js";
import { userRepo } from "../src/repositories/userRepo.js";
import { invoke } from "./helpers/httpMock.js";

function makeUser(email: string) {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: "Alice",
    email,
    role: "customer",
  } as any;
}

describe("auth registration hardening", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("register validates", async () => {
    const res = await invoke(authController.register, {
      body: { name: "A", email: "bad", password: "1" },
    });

    expect(res.statusCode).toBe(400);
    expect((res.body as any)?.error).toBe("VALIDATION_ERROR");
  });

  it("register handles duplicate key race with 409 conflict", async () => {
    jest.spyOn(authServiceDeps, "zxcvbnAsync").mockResolvedValue({ score: 4, feedback: {} } as any);
    jest.spyOn(authServiceDeps, "assertPasswordNotBreached").mockResolvedValue();
    jest.spyOn(userRepo, "findByEmail").mockResolvedValue(null as any);
    jest.spyOn(userRepo, "create").mockRejectedValue({
      code: 11000,
      keyPattern: { email: 1 },
    } as any);

    const res = await invoke(authController.register, {
      body: { name: "Alice", email: "alice@example.com", password: "StrongPass123!" },
    });

    expect(res.statusCode).toBe(409);
    expect((res.body as any)?.error).toBe("CONFLICT");
    expect((res.body as any)?.message).toBe("email already exists");
  });

  it("rejects weak passwords via zxcvbn", async () => {
    jest.spyOn(authServiceDeps, "zxcvbnAsync").mockResolvedValue({ score: 2, feedback: {} } as any);
    jest.spyOn(userRepo, "findByEmail").mockResolvedValue(null as any);

    const res = await invoke(authController.register, {
      body: { name: "Weak", email: "weak@example.com", password: "ValidFormat123!" },
    });

    expect(res.statusCode).toBe(400);
    expect((res.body as any)?.error).toBe("WEAK_PASSWORD");
  });

  it("rejects breached passwords when breach checker raises BREACHED_PASSWORD", async () => {
    jest.spyOn(authServiceDeps, "zxcvbnAsync").mockResolvedValue({ score: 4, feedback: {} } as any);
    jest.spyOn(userRepo, "findByEmail").mockResolvedValue(null as any);
    jest.spyOn(authServiceDeps, "assertPasswordNotBreached").mockRejectedValue(
      Object.assign(new Error("Password has appeared in a known breach"), { statusCode: 400, code: "BREACHED_PASSWORD" }),
    );

    const res = await invoke(authController.register, {
      body: { name: "Alice", email: "alice2@example.com", password: "StrongerPass123!" },
    });

    expect(res.statusCode).toBe(400);
    expect((res.body as any)?.error).toBe("BREACHED_PASSWORD");
  });

  it("fails closed when breach checker is unavailable", async () => {
    jest.spyOn(authServiceDeps, "zxcvbnAsync").mockResolvedValue({ score: 4, feedback: {} } as any);
    jest.spyOn(userRepo, "findByEmail").mockResolvedValue(null as any);
    jest.spyOn(authServiceDeps, "assertPasswordNotBreached").mockRejectedValue(
      Object.assign(new Error("Password breach check unavailable"), { statusCode: 503, code: "PASSWORD_CHECK_UNAVAILABLE" }),
    );

    const res = await invoke(authController.register, {
      body: { name: "Alice", email: "alice3@example.com", password: "StrongerPass123!" },
    });

    expect(res.statusCode).toBe(503);
    expect((res.body as any)?.error).toBe("PASSWORD_CHECK_UNAVAILABLE");
  });

  it("succeeds when breach checker passes", async () => {
    jest.spyOn(authServiceDeps, "zxcvbnAsync").mockResolvedValue({ score: 4, feedback: {} } as any);
    jest.spyOn(authServiceDeps, "assertPasswordNotBreached").mockResolvedValue();
    jest.spyOn(userRepo, "findByEmail").mockResolvedValue(null as any);
    jest.spyOn(userRepo, "create").mockResolvedValue(makeUser("alice@example.com"));

    const res = await invoke(authController.register, {
      body: { name: "Alice", email: "alice@example.com", password: "StrongerPass123!" },
    });

    expect(res.statusCode).toBe(200);
    expect((res.body as any)?.success).toBe(true);
    expect((res.body as any)?.data?.email).toBe("alice@example.com");
  });
});
