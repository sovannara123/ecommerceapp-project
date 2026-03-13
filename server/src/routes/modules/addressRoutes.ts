import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { addressController } from "../../controllers/addressController.js";

export const addressRouter = Router();
addressRouter.use(requireAuth());

addressRouter.get("/", (req, res, next) => addressController.list(req, res).catch(next));
addressRouter.post("/", (req, res, next) => addressController.create(req, res).catch(next));
addressRouter.put("/:id", (req, res, next) => addressController.update(req, res).catch(next));
addressRouter.delete("/:id", (req, res, next) => addressController.remove(req, res).catch(next));
addressRouter.put("/:id/set-default", (req, res, next) =>
  addressController.setDefault(req, res).catch(next),
);
