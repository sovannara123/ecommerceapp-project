import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectMongo } from "../infra/mongo.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

async function run() {
  await connectMongo();

  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    User.deleteMany({}),
  ]);

  const categories = await Category.insertMany([
    { name: "Phones", slug: "phones" },
    { name: "Laptops", slug: "laptops" },
    { name: "Fashion", slug: "fashion" },
  ]);

  const [phones, laptops, fashion] = categories;

  await Product.insertMany([
    {
      title: "iPhone 15 Pro",
      description: "Premium phone. Demo product.",
      images: ["https://picsum.photos/seed/iphone/800/600"],
      price: 999,
      currency: "USD",
      categoryId: phones._id,
      stock: 10,
      tags: ["apple", "phone"]
    },
    {
      title: "Galaxy S24",
      description: "Flagship Android. Demo product.",
      images: ["https://picsum.photos/seed/galaxy/800/600"],
      price: 899,
      currency: "USD",
      categoryId: phones._id,
      stock: 15,
      tags: ["samsung", "phone"]
    },
    {
      title: "MacBook Air",
      description: "Light laptop. Demo product.",
      images: ["https://picsum.photos/seed/mac/800/600"],
      price: 1199,
      currency: "USD",
      categoryId: laptops._id,
      stock: 7,
      tags: ["apple", "laptop"]
    },
    {
      title: "Khmer Streetwear Tee",
      description: "Comfort cotton tee. Demo product.",
      images: ["https://picsum.photos/seed/tee/800/600"],
      price: 19,
      currency: "USD",
      categoryId: fashion._id,
      stock: 100,
      tags: ["fashion"]
    }
  ]);

  const userPass = await bcrypt.hash("User1234!", 10);

  // Read admin credentials from environment — never hardcode
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL;
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!seedAdminEmail || !seedAdminPassword) {
    console.warn(
      "⚠️  SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD not set. Skipping admin seed.\n"
      + "   Set these env vars to create the initial admin account."
    );
  } else {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: seedAdminEmail, role: "admin" });
    if (existingAdmin) {
      console.log(`ℹ️  Admin "${seedAdminEmail}" already exists. Skipping.`);
    } else {
      // Use cost factor 12 for production-grade hashing
      const adminPassHash = await bcrypt.hash(seedAdminPassword, 12);
      await User.create({
        name: "Admin",
        email: seedAdminEmail,
        passwordHash: adminPassHash,
        role: "admin",
      });
      console.log(`✅ Admin account created: ${seedAdminEmail}`);
    }
  }

  await User.create({ name: "Test User", email: "user@example.com", passwordHash: userPass, role: "customer" });

  console.log("Seed complete.");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
