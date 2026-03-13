import { Request, Response } from "express";
import { ok } from "../utils/apiResponse.js";
import { addressService } from "../services/addressService.js";
import {
  addressCreateSchema,
  addressIdParamSchema,
  addressSetDefaultParamSchema,
  addressUpdateSchema,
} from "../validators/address.js";

export const addressController = {
  async list(req: Request, res: Response) {
    const addresses = await addressService.getAddresses(req.user!.sub);
    res.json(ok(addresses));
  },
  async create(req: Request, res: Response) {
    const body = addressCreateSchema.parse(req.body);
    const address = await addressService.createAddress(req.user!.sub, body);
    res.json(ok(address));
  },
  async update(req: Request, res: Response) {
    const { id } = addressIdParamSchema.parse(req.params);
    const body = addressUpdateSchema.parse(req.body);
    const address = await addressService.updateAddress(req.user!.sub, id, body);
    res.json(ok(address));
  },
  async remove(req: Request, res: Response) {
    const { id } = addressIdParamSchema.parse(req.params);
    await addressService.deleteAddress(req.user!.sub, id);
    res.json(ok(true));
  },
  async setDefault(req: Request, res: Response) {
    const { id } = addressSetDefaultParamSchema.parse(req.params);
    const address = await addressService.setDefault(req.user!.sub, id);
    res.json(ok(address));
  },
};
