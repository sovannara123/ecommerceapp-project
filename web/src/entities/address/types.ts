export type AddressLabel = "home" | "work" | "other";

export type AddressLocation = {
  lat: number;
  lng: number;
};

export type Address = {
  _id: string;
  userId: string;
  label: AddressLabel;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  location?: AddressLocation;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAddressRequest = {
  label?: AddressLabel;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
  location?: AddressLocation;
};

export type UpdateAddressRequest = Partial<CreateAddressRequest>;
