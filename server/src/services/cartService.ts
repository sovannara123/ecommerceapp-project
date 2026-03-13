import mongoose from "mongoose";
import { cartRepo } from "../repositories/cartRepo.js";
import { productRepo } from "../repositories/productRepo.js";

export const cartService = {
  async getCart(userId: string, deviceId: string) {
    return cartRepo.getOrCreate(userId, deviceId);
  },

  async addItem(userId: string, deviceId: string, productId: string, qty: number) {
    const product = await productRepo.get(productId);
    if (!product) throw Object.assign(new Error("Product not found"), { statusCode: 404, code: "PRODUCT_NOT_FOUND" });

    const cart = await cartRepo.getOrCreate(userId, deviceId);
    const idx = cart.items.findIndex((i: any) => String(i.productId) === String(product._id));
    const existingQty = idx >= 0 ? cart.items[idx].qty : 0;
    if (product.stock < (existingQty + qty)) {
      throw Object.assign(new Error("Insufficient stock"), { statusCode: 400, code: "OUT_OF_STOCK" });
    }
    if (idx >= 0) {
      cart.items[idx].qty += qty;
      cart.items[idx].priceSnapshot = product.price;
    } else {
      cart.items.push({ productId: new mongoose.Types.ObjectId(productId), qty, priceSnapshot: product.price });
    }
    await cartRepo.save(cart);
    return cart;
  },

  async updateQty(userId: string, deviceId: string, productId: string, qty: number) {
    const product = await productRepo.get(productId);
    if (!product) throw Object.assign(new Error("Product not found"), { statusCode: 404, code: "PRODUCT_NOT_FOUND" });
    if (product.stock < qty) throw Object.assign(new Error("Insufficient stock"), { statusCode: 400, code: "OUT_OF_STOCK" });

    const cart = await cartRepo.get(userId, deviceId);
    if (!cart) throw Object.assign(new Error("Cart not found"), { statusCode: 404, code: "CART_NOT_FOUND" });
    const idx = cart.items.findIndex((i: any) => String(i.productId) === String(product._id));
    if (idx < 0) throw Object.assign(new Error("Item not in cart"), { statusCode: 404, code: "ITEM_NOT_FOUND" });
    cart.items[idx].qty = qty;
    cart.items[idx].priceSnapshot = product.price;
    await cartRepo.save(cart);
    return cart;
  },

  async removeItem(userId: string, deviceId: string, productId: string) {
    const cart = await cartRepo.get(userId, deviceId);
    if (!cart) throw Object.assign(new Error("Cart not found"), { statusCode: 404, code: "CART_NOT_FOUND" });
    let found = false;
    for (let i = cart.items.length - 1; i >= 0; i -= 1) {
      if (String(cart.items[i].productId) === String(productId)) {
        cart.items.splice(i, 1);
        found = true;
      }
    }
    if (!found) {
      throw Object.assign(new Error("Item not in cart"), { statusCode: 404, code: "ITEM_NOT_FOUND" });
    }
    await cartRepo.save(cart);
    return cart;
  },

  async clear(userId: string, deviceId: string) {
    return cartRepo.clear(userId, deviceId);
  }
};
