import { Request, Response } from "express";
import { wishlistService } from "../services/wishlistService.js";
import { ok } from "../utils/apiResponse.js";
import { wishlistAddSchema, wishlistRemoveParamSchema } from "../validators/wishlist.js";

export const wishlistController = {
  async get(req: Request, res: Response) {
    const wishlist = await wishlistService.getWishlist(req.user!.sub);
    res.json(ok(wishlist));
  },
  async add(req: Request, res: Response) {
    const body = wishlistAddSchema.parse(req.body);
    const wishlist = await wishlistService.addToWishlist(req.user!.sub, body.productId);
    res.json(ok(wishlist));
  },
  async remove(req: Request, res: Response) {
    const { id } = wishlistRemoveParamSchema.parse(req.params);
    const wishlist = await wishlistService.removeFromWishlist(req.user!.sub, id);
    res.json(ok(wishlist));
  },
};
