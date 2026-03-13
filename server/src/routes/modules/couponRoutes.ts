import { Router } from "express";
import { couponController } from "../../controllers/couponController.js";
import { requireAuth } from "../../middlewares/auth.js";

export const couponRouter = Router();

couponRouter.post("/validate", (req, res, next) =>
  couponController.validate(req, res).catch(next),
);
couponRouter.post("/apply", requireAuth(), (req, res, next) =>
  couponController.apply(req, res).catch(next),
);
