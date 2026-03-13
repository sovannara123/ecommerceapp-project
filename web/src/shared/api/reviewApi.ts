import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/unwrap";
import type {
  CreateReviewRequest,
  Review,
  UpdateReviewRequest,
} from "@/entities/review/types";

export const reviewApi = {
  async createReview(data: CreateReviewRequest) {
    const res = await apiClient.post("/reviews", data);
    return unwrap<Review>(res);
  },
  async updateReview(id: string, data: UpdateReviewRequest) {
    const res = await apiClient.put(`/reviews/${id}`, data);
    return unwrap<Review>(res);
  },
  async deleteReview(id: string) {
    const res = await apiClient.delete(`/reviews/${id}`);
    return unwrap<boolean>(res);
  },
};
