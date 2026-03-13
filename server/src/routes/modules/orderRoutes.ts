import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.js";
import { orderController } from "../../controllers/orderController.js";

export const orderRouter = Router();

orderRouter.use(requireAuth());

orderRouter.post("/", (req, res, next) => orderController.create(req, res).catch(next));
orderRouter.get("/mine", (req, res, next) => orderController.listMine(req, res).catch(next));
orderRouter.get("/mine/:id", (req, res, next) => orderController.getMine(req, res).catch(next));
orderRouter.put("/:id/cancel", (req, res, next) => orderController.cancel(req, res).catch(next));
orderRouter.post("/:id/return", (req, res, next) => orderController.requestReturn(req, res).catch(next));
orderRouter.get("/:id/track", (req, res, next) => orderController.track(req, res).catch(next));

// admin
orderRouter.get("/admin/all", requireRole("admin"), (req, res, next) => orderController.adminList(req, res).catch(next));
orderRouter.patch("/admin/:id/status", requireRole("admin"), (req, res, next) => orderController.adminUpdateStatus(req, res).catch(next));
