export type ProviderTokenData = {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: number | null;
  scope?: string;
  [key: string]: unknown;
};

export type ProviderUserProfile = {
  id: string;
  name: string;
  username?: string;
  [key: string]: unknown;
};

export type UserProfile = {
  id: string;
  name: string;
  username?: string;
  email?: string | null;
  avatarUrl?: string;
  platformData?: Record<string, unknown>;
  [key: string]: unknown;
};
