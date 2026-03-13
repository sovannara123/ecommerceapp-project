import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 4000 },
  images: { type: [String], default: [] },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, required: false, min: 0 },
  currency: { type: String, enum: ["USD", "KHR"], default: "USD" },
  categoryId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "Category" },
  stock: { type: Number, required: true, min: 0 },
  isFeatured: { type: Boolean, default: false, index: true },
  tags: { type: [String], default: [] },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

ProductSchema.index({ title: "text", description: "text", tags: "text" });
ProductSchema.index({ categoryId: 1, createdAt: -1 });

export const Product = mongoose.model("Product", ProductSchema);
