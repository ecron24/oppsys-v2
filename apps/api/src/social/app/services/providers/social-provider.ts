import type { Result } from "@oppsys/shared";

export interface SocialProviderTokenData {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: number | null;
  tokenType: string;
  scope?: string;
}

export interface SocialProvider {
  getAuthUrl(state: string, redirectUri?: string): Promise<string>;

  exchangeCodeForToken(
    code: string,
    redirectUri?: string
  ): Promise<Result<SocialProviderTokenData>>;
}
