export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  dateOfBirth: string | null;
  avatar: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateProfileRequest = {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type UploadAvatarResponse = {
  avatarUrl: string;
};
