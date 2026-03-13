import { Category } from "../models/Category.js";

export const categoryRepo = {
  list() {
    return Category.find().sort({ name: 1 }).exec();
  },
  create(data: { name: string; slug: string }) {
    return Category.create(data);
  },
  update(id: string, data: any) {
    return Category.findByIdAndUpdate(id, data, { new: true }).exec();
  },
  remove(id: string) {
    return Category.findByIdAndDelete(id).exec();
  }
};
