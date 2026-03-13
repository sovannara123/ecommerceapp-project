import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";

jest.setTimeout(60_000);

describe("integration: cart semantics + 404 correctness", () => {
  let replSet: MongoMemoryReplSet;
  let app: any;
  let productId: string;
  let accessToken: string;

  beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({
      replSet: { count: 1 },
    });
    process.env.NODE_ENV = "test";
    process.env.MONGO_URI = replSet.getUri();
    process.env.JWT_ACCESS_SECRET = "test_access_secret_123456";
    process.env.JWT_REFRESH_SECRET = "test_refresh_secret_123456";
    process.env.HIBP_PASSWORD_CHECK_ENABLED = "false";
    process.env.HIBP_PASSWORD_CHECK_STRICT = "false";

    const { connectMongo } = await import("../../src/infra/mongo.js");
    const { authMiddlewareDeps } = await import("../../src/middlewares/auth.js");
    const { createApp } = await import("../../src/app.js");
    const { Category } = await import("../../src/models/Category.js");
    const { Product } = await import("../../src/models/Product.js");

    jest.spyOn(authMiddlewareDeps, "isAccessJtiBlacklisted").mockResolvedValue(false);

    await connectMongo();
    app = createApp();

    await Promise.all([Category.deleteMany({}), Product.deleteMany({})]);
    const category = await Category.create({ name: "Accessories", slug: "accessories" });
    const product = await Product.create({
      title: "Integration Case",
      description: "Integration test cart product",
      images: ["https://example.com/case.png"],
      price: 20,
      currency: "USD",
      categoryId: category._id,
      stock: 10,
      tags: ["integration"],
    });
    productId = String(product._id);

    const email = "cart-itg@example.com";
    const password = "Str0ngPass!123";
    await request(app).post("/api/auth/register").send({ name: "Cart ITG", email, password });
    const loginRes = await request(app)
      .post("/api/auth/login")
      .set("x-device-id", "device-cart-login")
      .send({ email, password });
    expect(loginRes.status).toBe(200);
    accessToken = loginRes.body?.data?.accessToken;
    expect(accessToken).toBeDefined();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (replSet) await replSet.stop();
  });

  it("lazily creates cart on GET and returns CART_NOT_FOUND for non-create ops when cart is missing", async () => {
    const newDevice = "device-cart-missing";

    const updateMissingRes = await request(app)
      .post("/api/cart/update")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-device-id", newDevice)
      .send({ productId, qty: 1 });
    expect(updateMissingRes.status).toBe(404);
    expect(updateMissingRes.body?.error).toBe("CART_NOT_FOUND");

    const removeMissingRes = await request(app)
      .post("/api/cart/remove")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-device-id", newDevice)
      .send({ productId });
    expect(removeMissingRes.status).toBe(404);
    expect(removeMissingRes.body?.error).toBe("CART_NOT_FOUND");

    const clearMissingRes = await request(app)
      .post("/api/cart/clear")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-device-id", newDevice);
    expect(clearMissingRes.status).toBe(404);
    expect(clearMissingRes.body?.error).toBe("CART_NOT_FOUND");

    const getRes = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-device-id", newDevice);
    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body?.data?.items)).toBe(true);
    expect(getRes.body?.data?.items).toHaveLength(0);
  });

  it("returns ITEM_NOT_FOUND when cart exists but product is not in cart", async () => {
    const existingCartDevice = "device-cart-existing";

    await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-device-id", existingCartDevice);

    const removeRes = await request(app)
      .post("/api/cart/remove")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-device-id", existingCartDevice)
      .send({ productId });

    expect(removeRes.status).toBe(404);
    expect(removeRes.body?.error).toBe("ITEM_NOT_FOUND");
  });
});
