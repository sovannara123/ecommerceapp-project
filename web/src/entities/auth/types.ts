export type UserRole = "customer" | "admin";

export type AuthProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthTokens = {
  user: AuthProfile;
  accessToken: string;
  expiresAt: string;
};

export type RefreshTokens = {
  accessToken: string;
  expiresAt: string;
};
