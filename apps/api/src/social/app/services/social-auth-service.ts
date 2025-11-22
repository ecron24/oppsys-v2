import * as crypto from "crypto";
import { SocialTokenManager } from "./social-token-manager";
import type { UserProfile } from "./social-type";
import type { Result } from "@oppsys/shared";
import type { SocialProviderTokenData } from "./providers/social-provider";
import type {
  ScopeLevel,
  SocialPlatform,
} from "src/social/domain/social-connection";
import { ProviderFactory } from "./social-provider-factory";
import type { Logger } from "src/logger/domain/logger";
import { tryCatch } from "src/lib/try-catch";
import type { SocialToken } from "src/social/domain/social-token";

export class SocialAuthService {
  constructor(
    private tokenManager: SocialTokenManager,
    private logger: Logger
  ) {}
  /**
   * Initier une connexion OAuth (avec support scopeLevel pour Google)
   */
  async initiateAuth({
    platform,
    redirectUri,
    scopeLevel = "basic",
  }: InitAuthParams): Promise<Result<{ authUrl: string; state: string }>> {
    return tryCatch(async () => {
      const provider = ProviderFactory.getProvider(platform);
      const state = crypto.randomBytes(16).toString("hex");

      // ✅ Gestion spéciale pour Google avec scopeLevel
      if (platform === "google") {
        const googleProvider = ProviderFactory.getProvider("google");
        const authUrl =
          scopeLevel === "advanced"
            ? await googleProvider.getAdvancedAuthUrl(state, redirectUri)
            : await googleProvider.getBasicAuthUrl(state, redirectUri);

        return {
          success: true,
          data: { authUrl, state },
        } as const;
      }

      // Pour les autres plateformes
      const authUrl = await provider.getAuthUrl(state, redirectUri);
      return {
        success: true,
        data: { authUrl, state },
      } as const;
    });
  }

  /**
   * Finaliser une connexion OAuth
   */
  async completeAuth({
    code,
    platform,
    state,
    userId,
    redirectUri,
  }: CompleteAuthParams): Promise<Result<CompleteAuthResult>> {
    return tryCatch(async () => {
      const provider = ProviderFactory.getProvider(platform);

      const tokenDataResult = await provider.exchangeCodeForToken(
        code,
        redirectUri,
        state
      );
      if (!tokenDataResult.success) return tokenDataResult;

      const tokenData: SocialProviderTokenData = tokenDataResult.data;
      // ✅ Normaliser le profil (convertir null en undefined)
      const rawProfileResult = await provider.getUserProfile(
        tokenData.accessToken
      );
      if (!rawProfileResult.success) return rawProfileResult;
      const rawProfile = rawProfileResult.data;
      const profileData: UserProfile = {
        ...rawProfile,
        email: "email" in rawProfile ? rawProfile.email : undefined,
      };

      const savedTokenResult = await this.tokenManager.saveToken({
        userId,
        platform,
        tokenData,
        profileData,
      });
      if (!savedTokenResult.success) return savedTokenResult;

      return {
        success: true,
        data: {
          success: true,
          profile: profileData,
          token: savedTokenResult.data,
        },
      };
    });
  }

  /**
   * Tester une connexion
   */
  async testConnection(
    userId: string,
    platform: SocialPlatform
  ): Promise<boolean> {
    try {
      const tokenResult = await this.tokenManager.getValidToken(
        userId,
        platform
      );
      if (!tokenResult.success) return false;

      const provider = ProviderFactory.getProvider(platform);
      const isValidResult = await provider.validateToken(
        tokenResult.data.accessToken
      );
      if (!isValidResult.success) return false;

      if (!isValidResult.data) {
        await this.tokenManager.markTokenInvalid(userId, platform);
      }

      return isValidResult.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        `[testConnection]: Connection test failed for ${platform}:`,
        error,
        { userId, platform }
      );
      await this.tokenManager.markTokenInvalid(userId, platform);
      return false;
    }
  }

  /**
   * Vérifier le statut de toutes les connexions
   */
  async checkAllConnectionStatuses(
    userId: string
  ): Promise<ConnectionStatus[]> {
    const tokensResult = await this.tokenManager.getAllUserTokens(userId);
    if (!tokensResult.success) return [];

    const tokens = tokensResult.data;
    const statuses: Promise<ConnectionStatus>[] = tokens.map(
      async (token: SocialToken) => {
        const isValid = await this.testConnection(
          userId,
          token.platform as SocialPlatform
        );
        return {
          platform: token.platform,
          isValid: isValid,
          lastUsed: token.lastUsed ?? null,
        };
      }
    );

    return Promise.all(statuses);
  }

  /**
   * Déconnecter une plateforme
   */
  async disconnectPlatform(
    userId: string,
    platform: SocialPlatform
  ): Promise<Result<void>> {
    return tryCatch(async () => {
      const result = await this.tokenManager.deleteToken(userId, platform);
      if (!result.success) return result;
      return { success: true, data: undefined };
    });
  }
}

interface CompleteAuthResult {
  success: boolean;
  profile: UserProfile;
  token: SocialToken;
}

interface ConnectionStatus {
  platform: string;
  isValid: boolean;
  error?: string;
  lastUsed: string | null;
}

type InitAuthParams = {
  platform: SocialPlatform;
  redirectUri?: string;
  scopeLevel?: ScopeLevel;
};

type CompleteAuthParams = {
  platform: SocialPlatform;
  code: string;
  state: string;
  userId: string;
  redirectUri?: string;
};
