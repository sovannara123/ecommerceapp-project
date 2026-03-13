import bcrypt from "bcryptjs";
import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";

jest.setTimeout(60_000);

describe("integration: auth -> cart -> order -> payment + RBAC", () => {
  let replSet: MongoMemoryReplSet;
  let app: any;
  let productId: string;
  let paymentService: any;

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

    const { connectMongo } = await import("../src/infra/mongo.js");
    const { authMiddlewareDeps } = await import("../src/middlewares/auth.js");
    const { createApp } = await import("../src/app.js");
    const { Category } = await import("../src/models/Category.js");
    const { Product } = await import("../src/models/Product.js");
    const paymentServiceModule = await import("../src/services/paymentService.js");

    jest.spyOn(authMiddlewareDeps, "isAccessJtiBlacklisted").mockResolvedValue(false);

    paymentService = paymentServiceModule.paymentService;
    await connectMongo();
    app = createApp();

    await Promise.all([Category.deleteMany({}), Product.deleteMany({})]);

    const category = await Category.create({ name: "Phones", slug: "phones" });

    const product = await Product.create({
      title: "Integration Phone",
      description: "Integration test product",
      images: ["https://example.com/p.png"],
      price: 100,
      currency: "USD",
      categoryId: category._id,
      stock: 20,
      tags: ["integration"],
    });
    productId = String(product._id);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (replSet) await replSet.stop();
  });

  it("covers auth, cart, order, payment, and RBAC", async () => {
    const deviceId = "device-itg-12345";
    const email = "itg@example.com";
    const password = "Str0ngPass!123";

    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Integration User",
      email,
      password,
    });
    expect(registerRes.status).toBe(200);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .set("x-device-id", deviceId)
      .send({ email, password });
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body?.data?.accessToken;
    expect(accessToken).toBeDefined();

    const removeRes = await request(app)
      .post("/api/cart/remove")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-device-id", deviceId)
      .send({ productId });
    expect(removeRes.status).toBe(404);
    expect(removeRes.body?.error).toBe("CART_NOT_FOUND");

    const addRes = await request(app)
      .post("/api/cart/add")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-device-id", deviceId)
      .send({ productId, qty: 2 });
    expect(addRes.status).toBe(200);

    const createOrderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("x-device-id", deviceId)
      .send({
        address: {
          fullName: "Integration User",
          phone: "012345678",
          line1: "Street 1",
          city: "Phnom Penh",
          province: "Phnom Penh",
          postalCode: "12000",
        },
      });
    expect(createOrderRes.status).toBe(200);
    const orderId = createOrderRes.body?.data?._id;
    expect(orderId).toBeDefined();

    const paymentSpy = jest.spyOn(paymentService, "createPaywayPayment").mockResolvedValue({
      provider: "payway",
      mode: "deeplink",
      tranId: "tran-123",
      qrString: "qr",
      deeplink: "deeplink",
      appStore: "app",
      playStore: "play",
    } as any);
    const paymentRes = await request(app)
      .post("/api/payments/payway/create")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ orderId, paymentOption: "abapay_deeplink" });
    expect(paymentRes.status).toBe(200);
    expect(paymentSpy).toHaveBeenCalledTimes(1);

    const customerAdminRes = await request(app)
      .get("/api/orders/admin/all")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(customerAdminRes.status).toBe(403);

    const { User } = await import("../src/models/User.js");
    await User.create({
      name: "Admin",
      email: "admin-itg@example.com",
      passwordHash: await bcrypt.hash("Admin1234!", 10),
      role: "admin",
    });

    const adminLoginRes = await request(app)
      .post("/api/auth/login")
      .set("x-device-id", "device-admin-99999")
      .send({ email: "admin-itg@example.com", password: "Admin1234!" });
    expect(adminLoginRes.status).toBe(200);
    const adminAccess = adminLoginRes.body?.data?.accessToken;
    expect(adminAccess).toBeDefined();

    const adminListRes = await request(app)
      .get("/api/orders/admin/all")
      .set("Authorization", `Bearer ${adminAccess}`);
    expect(adminListRes.status).toBe(200);
    expect(Array.isArray(adminListRes.body?.data)).toBe(true);
  });
});
