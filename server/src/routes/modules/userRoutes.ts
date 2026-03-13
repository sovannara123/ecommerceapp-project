import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { requireAuth } from "../../middlewares/auth.js";
import { userController } from "../../controllers/userController.js";

const AVATAR_DIR = path.resolve(process.cwd(), "uploads", "avatars");
mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, AVATAR_DIR);
  },
  filename: (_req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}_${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.mimetype)) {
      cb(
        Object.assign(new Error("Only jpg, png, and webp files are allowed"), {
          statusCode: 422,
          code: "VALIDATION_ERROR",
        }),
      );
      return;
    }
    cb(null, true);
  },
});

export const userRouter = Router();
userRouter.use(requireAuth());

userRouter.get("/profile", (req, res, next) =>
  userController.getProfile(req, res).catch(next),
);
userRouter.put("/profile", (req, res, next) =>
  userController.updateProfile(req, res).catch(next),
);
userRouter.put("/change-password", (req, res, next) =>
  userController.changePassword(req, res).catch(next),
);
userRouter.post(
  "/upload-avatar",
  (req, res, next) => {
    upload.single("avatar")(req, res, (err: any) => {
      if (!err) return next();
      if ((err as any).code === "LIMIT_FILE_SIZE") {
        return next(
          Object.assign(new Error("Avatar file must be smaller than 5MB"), {
            statusCode: 422,
            code: "VALIDATION_ERROR",
          }),
        );
      }
      return next(err);
    });
  },
  (req, res, next) => userController.uploadAvatar(req, res).catch(next),
);
