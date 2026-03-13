import { Router } from "express";
import { authRouter } from "./modules/authRoutes.js";
import { catalogRouter } from "./modules/catalogRoutes.js";
import { cartRouter } from "./modules/cartRoutes.js";
import { orderRouter } from "./modules/orderRoutes.js";
import { paymentRouter } from "./modules/paymentRoutes.js";
import { userRouter } from "./modules/userRoutes.js";
import { wishlistRouter } from "./modules/wishlistRoutes.js";
import { addressRouter } from "./modules/addressRoutes.js";
import { couponRouter } from "./modules/couponRoutes.js";
import { notificationRouter } from "./modules/notificationRoutes.js";
import { reviewRouter } from "./modules/reviewRoutes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/catalog", catalogRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/addresses", addressRouter);
apiRouter.use("/coupons", couponRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/reviews", reviewRouter);
