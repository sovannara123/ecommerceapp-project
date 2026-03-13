import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/unwrap";
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UploadAvatarResponse,
  UserProfile,
} from "@/entities/user/types";

export const profileApi = {
  async getProfile() {
    const res = await apiClient.get("/user/profile");
    return unwrap<UserProfile>(res);
  },
  async updateProfile(data: UpdateProfileRequest) {
    const res = await apiClient.put("/user/profile", data);
    return unwrap<UserProfile>(res);
  },
  async changePassword(data: ChangePasswordRequest) {
    const res = await apiClient.put("/user/change-password", data);
    return unwrap<boolean>(res);
  },
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await apiClient.post("/user/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap<UploadAvatarResponse>(res);
  },
};
