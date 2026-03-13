import { Router } from "express";
import { categoryController } from "../../controllers/categoryController.js";
import { productController } from "../../controllers/productController.js";
import { requireAuth, requireRole } from "../../middlewares/auth.js";

export const catalogRouter = Router();

// public
catalogRouter.get("/categories", (req, res, next) => categoryController.list(req, res).catch(next));
catalogRouter.get("/products", (req, res, next) => productController.list(req, res).catch(next));
catalogRouter.get("/products/featured", (req, res, next) => productController.featured(req, res).catch(next));
catalogRouter.get("/products/deals", (req, res, next) => productController.deals(req, res).catch(next));
catalogRouter.get("/products/:id/reviews", (req, res, next) => productController.reviews(req, res).catch(next));
catalogRouter.get("/products/:id", (req, res, next) => productController.get(req, res).catch(next));

// admin
catalogRouter.post("/categories", requireAuth(), requireRole("admin"), (req, res, next) => categoryController.create(req, res).catch(next));
catalogRouter.patch("/categories/:id", requireAuth(), requireRole("admin"), (req, res, next) => categoryController.update(req, res).catch(next));
catalogRouter.delete("/categories/:id", requireAuth(), requireRole("admin"), (req, res, next) => categoryController.remove(req, res).catch(next));

catalogRouter.post("/products", requireAuth(), requireRole("admin"), (req, res, next) => productController.create(req, res).catch(next));
catalogRouter.patch("/products/:id", requireAuth(), requireRole("admin"), (req, res, next) => productController.update(req, res).catch(next));
catalogRouter.delete("/products/:id", requireAuth(), requireRole("admin"), (req, res, next) => productController.remove(req, res).catch(next));
