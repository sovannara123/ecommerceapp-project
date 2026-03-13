import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { wishlistController } from "../../controllers/wishlistController.js";

export const wishlistRouter = Router();
wishlistRouter.use(requireAuth());

wishlistRouter.get("/", (req, res, next) => wishlistController.get(req, res).catch(next));
wishlistRouter.post("/add", (req, res, next) => wishlistController.add(req, res).catch(next));
wishlistRouter.delete("/remove/:id", (req, res, next) => wishlistController.remove(req, res).catch(next));
