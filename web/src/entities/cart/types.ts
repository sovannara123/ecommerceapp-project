export type CartItem = {
  productId: string;
  qty: number;
  priceSnapshot: number;
};

export type Cart = {
  _id: string;
  userId: string;
  deviceId: string;
  items: CartItem[];
};

export type CartAddRequest = { productId: string; qty: number };
export type CartUpdateRequest = { productId: string; qty: number };
export type CartRemoveRequest = { productId: string };
