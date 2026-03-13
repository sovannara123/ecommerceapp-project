export type Review = {
  _id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateReviewRequest = {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
  images?: string[];
};

export type UpdateReviewRequest = {
  rating?: number;
  comment?: string;
  images?: string[];
};
