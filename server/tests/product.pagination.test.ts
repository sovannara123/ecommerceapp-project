import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Product } from "../src/models/Product.js";
import { productRepo } from "../src/repositories/productRepo.js";

describe("productRepo.list cursor pagination", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  });

  beforeEach(async () => {
    await Product.deleteMany({});
    const categoryId = new mongoose.Types.ObjectId();
    const base = {
      description: "Pagination test product",
      images: ["https://example.com/p.png"],
      currency: "USD" as const,
      categoryId,
      stock: 10,
      tags: ["pagination"],
    };
    await Product.create([
      { ...base, title: "P1", price: 10 },
      { ...base, title: "P2", price: 10 },
      { ...base, title: "P3", price: 20 },
      { ...base, title: "P4", price: 20 },
      { ...base, title: "P5", price: 30 },
      { ...base, title: "P6", price: 30 },
    ]);
  });

  async function collectAll(sort: "price_asc" | "price_desc") {
    const seenIds: string[] = [];
    let cursor: string | undefined;
    while (true) {
      const page = await productRepo.list({
        sort,
        limit: 2,
        q: undefined,
        categoryId: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        cursor,
      });
      seenIds.push(...page.items.map((it: any) => String(it._id)));
      if (!page.nextCursor) break;
      cursor = page.nextCursor;
    }
    return seenIds;
  }

  it("returns stable pages for price_asc without duplicates or gaps", async () => {
    const expected = await Product.find({}).sort({ price: 1, _id: 1 }).select({ _id: 1 }).lean().exec();
    const actual = await collectAll("price_asc");
    expect(actual).toEqual(expected.map((x: any) => String(x._id)));
  });

  it("returns stable pages for price_desc without duplicates or gaps", async () => {
    const expected = await Product.find({}).sort({ price: -1, _id: -1 }).select({ _id: 1 }).lean().exec();
    const actual = await collectAll("price_desc");
    expect(actual).toEqual(expected.map((x: any) => String(x._id)));
  });

  it("supports legacy cursor format for price sorting", async () => {
    const firstPage = await productRepo.list({
      sort: "price_asc",
      limit: 2,
      q: undefined,
      categoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      cursor: undefined,
    });
    const legacyCursor = Buffer.from(String(firstPage.items[1]._id), "utf-8").toString("base64");

    const nextPage = await productRepo.list({
      sort: "price_asc",
      limit: 2,
      q: undefined,
      categoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      cursor: legacyCursor,
    });

    const expected = await Product.find({}).sort({ price: 1, _id: 1 }).select({ _id: 1 }).lean().exec();
    expect(nextPage.items.map((x: any) => String(x._id))).toEqual([
      String(expected[2]._id),
      String(expected[3]._id),
    ]);
  });
});
