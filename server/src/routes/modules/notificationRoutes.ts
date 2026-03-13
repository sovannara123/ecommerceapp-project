import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { notificationController } from "../../controllers/notificationController.js";

export const notificationRouter = Router();
notificationRouter.use(requireAuth());

notificationRouter.get("/", (req, res, next) =>
  notificationController.list(req, res).catch(next),
);
notificationRouter.put("/:id/read", (req, res, next) =>
  notificationController.markRead(req, res).catch(next),
);
notificationRouter.put("/read-all", (req, res, next) =>
  notificationController.markAllRead(req, res).catch(next),
);
notificationRouter.post("/register-token", (req, res, next) =>
  notificationController.registerToken(req, res).catch(next),
);
