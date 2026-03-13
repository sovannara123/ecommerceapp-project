import { Request, Response } from "express";
import { catalogService } from "../services/catalogService.js";
import { ok } from "../utils/apiResponse.js";
import {
  listProductsSchema,
  productCreateSchema,
  productIdParamSchema,
  productReviewsQuerySchema,
  productUpdateSchema,
} from "../validators/catalog.js";

export const productController = {
  async list(req: Request, res: Response) {
    const q = listProductsSchema.parse(req.query);
    const out = await catalogService.listProducts(q);
    res.json(ok(out));
  },
  async get(req: Request, res: Response) {
    const { id } = productIdParamSchema.parse(req.params);
    const p = await catalogService.getProduct(id);
    if (!p) throw Object.assign(new Error("Product not found"), { statusCode: 404, code: "PRODUCT_NOT_FOUND" });
    res.json(ok(p));
  },
  async featured(_req: Request, res: Response) {
    const items = await catalogService.listFeaturedProducts();
    res.json(ok(items));
  },
  async deals(_req: Request, res: Response) {
    const items = await catalogService.listDealsProducts();
    res.json(ok(items));
  },
  async reviews(req: Request, res: Response) {
    const { id } = productIdParamSchema.parse(req.params);
    const query = productReviewsQuerySchema.parse(req.query);
    const out = await catalogService.listProductReviews(id, query.page, query.limit);
    res.json(ok(out));
  },
  async create(req: Request, res: Response) {
    const body = productCreateSchema.parse(req.body);
    const p = await catalogService.createProduct(body);
    res.json(ok(p));
  },
  async update(req: Request, res: Response) {
    const { id } = productIdParamSchema.parse(req.params);
    const body = productUpdateSchema.parse(req.body);
    const p = await catalogService.updateProduct(id, body);
    if (!p) throw Object.assign(new Error("Product not found"), { statusCode: 404, code: "PRODUCT_NOT_FOUND" });
    res.json(ok(p));
  },
  async remove(req: Request, res: Response) {
    const { id } = productIdParamSchema.parse(req.params);
    const p = await catalogService.removeProduct(id);
    if (!p) throw Object.assign(new Error("Product not found"), { statusCode: 404, code: "PRODUCT_NOT_FOUND" });
    res.json(ok(p));
  },
};
