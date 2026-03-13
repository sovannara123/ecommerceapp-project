import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { cartController } from "../../controllers/cartController.js";

export const cartRouter = Router();
cartRouter.use(requireAuth());

cartRouter.get("/", (req, res, next) => cartController.get(req, res).catch(next));
cartRouter.post("/add", (req, res, next) => cartController.add(req, res).catch(next));
cartRouter.post("/update", (req, res, next) => cartController.update(req, res).catch(next));
cartRouter.post("/remove", (req, res, next) => cartController.remove(req, res).catch(next));
cartRouter.post("/clear", (req, res, next) => cartController.clear(req, res).catch(next));
