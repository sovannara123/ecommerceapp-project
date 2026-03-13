import mongoose from "mongoose";

export type UserRole = "customer" | "admin";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    phone: { type: String, required: false, trim: true },
    dateOfBirth: { type: Date, required: false },
    avatar: { type: String, required: false },
    resetOtpHash: { type: String, required: false },
    resetOtpExpiresAt: { type: Date, required: false },
    deletedAt: { type: Date, required: false },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", UserSchema);
