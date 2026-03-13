import { Request, Response } from "express";
import { catalogService } from "../services/catalogService.js";
import { ok } from "../utils/apiResponse.js";
import { categoryCreateSchema } from "../validators/catalog.js";

export const categoryController = {
  async list(_req: Request, res: Response) {
    const items = await catalogService.listCategories();
    res.json(ok(items));
  },
  async create(req: Request, res: Response) {
    const body = categoryCreateSchema.parse(req.body);
    const cat = await catalogService.createCategory(body);
    res.json(ok(cat));
  },
  async update(req: Request, res: Response) {
    const body = categoryCreateSchema.partial().parse(req.body);
    const cat = await catalogService.updateCategory(req.params.id, body);
    if (!cat) throw Object.assign(new Error("Category not found"), { statusCode: 404, code: "CATEGORY_NOT_FOUND" });
    res.json(ok(cat));
  },
  async remove(req: Request, res: Response) {
    const cat = await catalogService.removeCategory(req.params.id);
    if (!cat) throw Object.assign(new Error("Category not found"), { statusCode: 404, code: "CATEGORY_NOT_FOUND" });
    res.json(ok(cat));
  },
};
