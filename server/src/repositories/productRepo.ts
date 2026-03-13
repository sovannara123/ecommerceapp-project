import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import mongoose from "mongoose";

type ProductSort = "new" | "price_asc" | "price_desc";

type ParsedCursor =
  | { id: string; price?: number }
  | null;

function decodeCursor(cursor: string): unknown {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8");
  try {
    return JSON.parse(decoded);
  } catch {
    return decoded;
  }
}

function encodeLegacyCursor(id: string) {
  return Buffer.from(id, "utf-8").toString("base64");
}

function encodePriceCursor(id: string, price: number) {
  return Buffer.from(JSON.stringify({ id, price }), "utf-8").toString("base64");
}

async function parseCursor(cursor: string | undefined, sort: ProductSort): Promise<ParsedCursor> {
  if (!cursor) return null;

  const parsed = decodeCursor(cursor);
  if (typeof parsed === "object" && parsed !== null) {
    const id = String((parsed as any).id || "");
    const price = Number((parsed as any).price);
    if (mongoose.Types.ObjectId.isValid(id)) {
      if (sort === "new") return { id };
      if (Number.isFinite(price)) return { id, price };
    }
  }

  const legacyId = String(parsed || "");
  if (!mongoose.Types.ObjectId.isValid(legacyId)) return null;
  if (sort === "new") return { id: legacyId };

  const lastDoc = await Product.findById(legacyId).select({ price: 1 }).lean().exec();
  if (!lastDoc) return null;
  return { id: legacyId, price: Number(lastDoc.price) };
}

export const productRepo = {
  async list(params: {
    q?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort: "new"|"price_asc"|"price_desc";
    limit: number;
    cursor?: string;
  }) {
    const query: any = {};
    if (params.q) query.$text = { $search: params.q };
    if (params.categoryId) query.categoryId = new mongoose.Types.ObjectId(params.categoryId);
    if (params.minPrice != null || params.maxPrice != null) {
      query.price = {};
      if (params.minPrice != null) query.price.$gte = params.minPrice;
      if (params.maxPrice != null) query.price.$lte = params.maxPrice;
    }

    const sort: any =
      params.sort === "new" ? { createdAt: -1, _id: -1 } :
      params.sort === "price_asc" ? { price: 1, _id: 1 } :
      { price: -1, _id: -1 };

    const cursor = await parseCursor(params.cursor, params.sort);
    if (cursor) {
      const lastId = new mongoose.Types.ObjectId(cursor.id);
      if (params.sort === "new") {
        query._id = { $lt: lastId };
      } else if (params.sort === "price_asc") {
        query.$or = [
          { price: { $gt: cursor.price } },
          { price: cursor.price, _id: { $gt: lastId } },
        ];
      } else {
        query.$or = [
          { price: { $lt: cursor.price } },
          { price: cursor.price, _id: { $lt: lastId } },
        ];
      }
    }

    const items = await Product.find(query).sort(sort).limit(params.limit + 1).exec();
    const hasMore = items.length > params.limit;
    const sliced = items.slice(0, params.limit);
    let nextCursor: string | null = null;
    if (hasMore && sliced.length > 0) {
      const last = sliced[sliced.length - 1];
      nextCursor = params.sort === "new"
        ? encodeLegacyCursor(String(last._id))
        : encodePriceCursor(String(last._id), Number(last.price));
    }
    return { items: sliced, nextCursor };
  },
  get(id: string) {
    return Product.findById(id).exec();
  },
  create(data: any) {
    return Product.create(data);
  },
  update(id: string, data: any) {
    return Product.findByIdAndUpdate(id, data, { new: true }).exec();
  },
  remove(id: string) {
    return Product.findByIdAndDelete(id).exec();
  },
  listFeatured(limit = 20) {
    return Product.find({ isFeatured: true })
      .sort({ updatedAt: -1, _id: -1 })
      .limit(limit)
      .populate("categoryId")
      .exec();
  },
  async listDeals(limit = 20) {
    const docs = await Product.aggregate([
      {
        $match: {
          salePrice: { $exists: true, $ne: null, $gt: 0 },
          $expr: { $lt: ["$salePrice", "$price"] },
        },
      },
      {
        $addFields: {
          discountPercentage: {
            $multiply: [
              {
                $divide: [
                  { $subtract: ["$price", "$salePrice"] },
                  "$price",
                ],
              },
              100,
            ],
          },
        },
      },
      { $sort: { discountPercentage: -1, updatedAt: -1, _id: -1 } },
      { $limit: limit },
    ]).exec();

    return Product.populate(docs, { path: "categoryId" });
  },
  async listReviewsForProduct(
    productId: string,
    page: number,
    limit: number,
  ) {
    const pid = new mongoose.Types.ObjectId(productId);
    const [items, total, stats] = await Promise.all([
      Review.find({ productId: pid })
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "name avatar")
        .exec(),
      Review.countDocuments({ productId: pid }).exec(),
      Review.aggregate([
        { $match: { productId: pid } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            one: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
            two: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            three: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            four: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            five: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          },
        },
      ]).exec(),
    ]);

    const summary = stats[0] || {};
    const ratingBreakdown = {
      1: summary.one ?? 0,
      2: summary.two ?? 0,
      3: summary.three ?? 0,
      4: summary.four ?? 0,
      5: summary.five ?? 0,
    };

    return {
      items,
      page,
      limit,
      total,
      hasMore: page * limit < total,
      averageRating: Number((summary.averageRating ?? 0).toFixed(2)),
      ratingBreakdown,
    };
  },
};
