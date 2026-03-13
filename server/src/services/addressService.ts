import { addressRepo } from "../repositories/addressRepo.js";

export const addressService = {
  async getAddresses(userId: string) {
    return addressRepo.list(userId);
  },

  async createAddress(
    userId: string,
    data: {
      label?: "home" | "work" | "other";
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country?: string;
      isDefault?: boolean;
      location?: { lat: number; lng: number };
    },
  ) {
    if (!data.fullName || !data.phone || !data.addressLine1 || !data.city || !data.state || !data.postalCode) {
      throw Object.assign(new Error("Missing required address fields"), {
        statusCode: 422,
        code: "VALIDATION_ERROR",
      });
    }

    const count = await addressRepo.count(userId);
    const shouldDefault = count === 0 ? true : !!data.isDefault;

    if (shouldDefault) {
      await addressRepo.unsetDefaultForUser(userId);
    }

    const created = await addressRepo.create({
      ...data,
      userId,
      isDefault: shouldDefault,
    });

    return created;
  },

  async updateAddress(
    userId: string,
    addressId: string,
    data: Partial<{
      label: "home" | "work" | "other";
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
      location?: { lat: number; lng: number };
    }>,
  ) {
    const existing = await addressRepo.findByIdForUser(userId, addressId);
    if (!existing) {
      throw Object.assign(new Error("Address not found"), {
        statusCode: 404,
        code: "ADDRESS_NOT_FOUND",
      });
    }

    if (data.isDefault === true) {
      await addressRepo.unsetDefaultForUser(userId);
    }

    const updated = await addressRepo.updateByIdForUser(userId, addressId, data);
    if (!updated) {
      throw Object.assign(new Error("Address not found"), {
        statusCode: 404,
        code: "ADDRESS_NOT_FOUND",
      });
    }

    return updated;
  },

  async deleteAddress(userId: string, addressId: string) {
    const deleted = await addressRepo.deleteByIdForUser(userId, addressId);
    if (!deleted) {
      throw Object.assign(new Error("Address not found"), {
        statusCode: 404,
        code: "ADDRESS_NOT_FOUND",
      });
    }

    if (deleted.isDefault) {
      const next = await addressRepo.findLatestForUser(userId);
      if (next) {
        await addressRepo.setDefault(userId, String(next._id));
      }
    }

    return true;
  },

  async setDefault(userId: string, addressId: string) {
    const existing = await addressRepo.findByIdForUser(userId, addressId);
    if (!existing) {
      throw Object.assign(new Error("Address not found"), {
        statusCode: 404,
        code: "ADDRESS_NOT_FOUND",
      });
    }

    await addressRepo.unsetDefaultForUser(userId);
    const updated = await addressRepo.setDefault(userId, addressId);
    if (!updated) {
      throw Object.assign(new Error("Address not found"), {
        statusCode: 404,
        code: "ADDRESS_NOT_FOUND",
      });
    }

    return updated;
  },
};
