import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { reviewController } from "../../controllers/reviewController.js";

export const reviewRouter = Router();
reviewRouter.use(requireAuth());

reviewRouter.post("/", (req, res, next) => reviewController.create(req, res).catch(next));
reviewRouter.put("/:id", (req, res, next) => reviewController.update(req, res).catch(next));
reviewRouter.delete("/:id", (req, res, next) => reviewController.remove(req, res).catch(next));
