export type AuthUser = {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  role?: string | string[];
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  fullName: string;
  userName: string;
  email: string;
};