import { Request, Response } from "express";
import { ok } from "../utils/apiResponse.js";
import { reviewService } from "../services/reviewService.js";
import {
  reviewCreateSchema,
  reviewIdParamSchema,
  reviewUpdateSchema,
} from "../validators/review.js";

export const reviewController = {
  async create(req: Request, res: Response) {
    const body = reviewCreateSchema.parse(req.body);
    const review = await reviewService.create({
      userId: req.user!.sub,
      productId: body.productId,
      orderId: body.orderId,
      rating: body.rating,
      comment: body.comment,
      images: body.images,
    });
    res.json(ok(review));
  },
  async update(req: Request, res: Response) {
    const { id } = reviewIdParamSchema.parse(req.params);
    const body = reviewUpdateSchema.parse(req.body);
    const review = await reviewService.update({
      userId: req.user!.sub,
      reviewId: id,
      data: body,
    });
    res.json(ok(review));
  },
  async remove(req: Request, res: Response) {
    const { id } = reviewIdParamSchema.parse(req.params);
    await reviewService.remove({ userId: req.user!.sub, reviewId: id });
    res.json(ok(true));
  },
};
