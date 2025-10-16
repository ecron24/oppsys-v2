import type { Result } from "@oppsys/types";
import * as crypto from "crypto";
import { tryCatch } from "src/lib/try-catch";
import type { SocialProviderTokenData } from "./providers/social-provider";
import type { SocialPlatform } from "src/social/domain/social-connection";
import { ProviderFactory } from "./social-provider-factory";
import type { Logger } from "src/logger/domain/logger";
import { env } from "src/env";
import type { SocialTokenRepo } from "src/social/domain/social-token-repo";
import type { UserProfile } from "./social-type";
import type { SocialToken } from "src/social/domain/social-token";

const ENCRYPTION_KEY = env.OAUTH_TOKEN_ENCRYPTION_KEY!;
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

type SaveTokenParams = {
  userId: string;
  platform: SocialPlatform;
  tokenData: SocialProviderTokenData;
  profileData: UserProfile;
};

export class SocialTokenManager {
  constructor(
    private socialTokenRepo: SocialTokenRepo,
    private loggger: Logger
  ) {}

  async saveToken({
    platform,
    profileData,
    tokenData,
    userId,
  }: SaveTokenParams): Promise<Result<SocialToken, Error>> {
    return tryCatch(async () => {
      const tokenRecord: Omit<SocialToken, "id"> = {
        userId,
        platform,
        accessToken: this.encryptToken(tokenData.accessToken),
        refreshToken: tokenData.refreshToken
          ? this.encryptToken(tokenData.refreshToken)
          : null,
        expiresAt: tokenData.expiresAt
          ? new Date(tokenData.expiresAt).toISOString()
          : null,
        scopes: tokenData.scope
          ? tokenData.scope
              .replace(/,/g, " ")
              .split(" ")
              .filter((s) => s)
          : [],
        platformUserId: profileData.id,
        platformUsername: profileData.username,
        isValid: true,
        lastUsed: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await this.socialTokenRepo.upsert(tokenRecord);

      if (!result.success) return result;

      return {
        success: true,
        data: result.data,
      };
    });
  }

  async getToken(
    userId: string,
    platform: SocialPlatform
  ): Promise<Result<SocialToken | null, Error>> {
    return tryCatch(async () => {
      const result = await this.socialTokenRepo.findByUserIdAndPlatform(
        userId,
        platform
      );

      if (!result.success) return result;
      if (!result.data) {
        return { success: true, data: null };
      }

      const token = result.data;

      return {
        success: true,
        data: {
          ...token,
          accessToken: this.decryptToken(token.accessToken),
          refreshToken: token.refreshToken
            ? this.decryptToken(token.refreshToken)
            : null,
        },
      };
    });
  }

  async getValidToken(
    userId: string,
    platform: SocialPlatform
  ): Promise<Result<SocialToken, Error>> {
    return tryCatch(async () => {
      const tokenResult = await this.getToken(userId, platform);
      if (!tokenResult.success) throw tokenResult.error;
      if (!tokenResult.data)
        throw new Error(
          `No token found for user ${userId} on platform ${platform}`
        );

      const tokenData = tokenResult.data;

      if (!tokenData.isValid) throw new Error("Token is marked as invalid");

      const isExpired = tokenData.expiresAt
        ? new Date(tokenData.expiresAt).getTime() < Date.now() + 5 * 60 * 1000
        : false;

      if (isExpired) {
        if (tokenData.refreshToken) {
          this.loggger.debug(
            `⚠️ Token for ${platform} is expiring, attempting refresh.`
          );
          const refreshedTokenResult = await this.refreshToken(
            userId,
            platform
          );
          if (!refreshedTokenResult.success) throw refreshedTokenResult.error;
          return { success: true, data: refreshedTokenResult.data };
        } else {
          await this.markTokenInvalid(userId, platform);
          throw new Error("Token expired and no refresh token available");
        }
      }
      await this.updateLastUsed(userId, platform);
      return { success: true, data: tokenData };
    });
  }

  async refreshToken(
    userId: string,
    platform: SocialPlatform
  ): Promise<Result<SocialToken>> {
    const existingTokenResult = await this.getToken(userId, platform);
    if (!existingTokenResult.success) return existingTokenResult;

    if (!existingTokenResult.data?.refreshToken) {
      await this.markTokenInvalid(userId, platform);
      return {
        success: false,
        error: new Error("No refresh token available"),
        kind: "REFRESH_TOKEN_MISSING",
      };
    }

    try {
      const provider = ProviderFactory.getProvider(platform);
      const newTokenDataResult = await provider.refreshAccessToken(
        existingTokenResult.data.refreshToken
      );
      if (!newTokenDataResult.success) return newTokenDataResult;

      const rawProfileResult = await provider.getUserProfile(
        newTokenDataResult.data.accessToken
      );
      if (!rawProfileResult.success) return rawProfileResult;
      const rawProfile = rawProfileResult.data;
      const profileData: UserProfile = {
        ...rawProfileResult.data,
        email: "email" in rawProfile ? rawProfile.email : undefined,
      };

      return await this.saveToken({
        userId,
        platform,
        tokenData: newTokenDataResult.data,
        profileData,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.markTokenInvalid(userId, platform);
      this.loggger.error(
        `[refreshToken]: Error refreshing token for ${platform}:`,
        error,
        {
          platform,
          userId,
        }
      );
      return {
        success: false,
        error: new Error(
          `Failed to refresh ${platform} token: ${error.message}`
        ),
        kind: "REFRESH_TOKEN_FAILED",
      };
    }
  }

  async markTokenInvalid(
    userId: string,
    platform: SocialPlatform
  ): Promise<Result<void, Error>> {
    return tryCatch(async () => {
      const result = await this.socialTokenRepo.updateByUserIdAndPlateform(
        { platform, userId },
        { isValid: false }
      );
      if (!result.success) {
        this.loggger.error(
          `[markTokenInvalid]: Error marking token invalid for ${platform}:`,
          result.error,
          { platform, userId }
        );
        throw new Error(
          `Failed to mark token as invalid: ${result.error.message}`
        );
      }
      this.loggger.debug(`⚠️ Token marked as invalid for ${platform}`);
      return { success: true, data: undefined };
    });
  }

  async updateLastUsed(
    userId: string,
    platform: SocialPlatform
  ): Promise<Result<void, Error>> {
    return tryCatch(async () => {
      const result = await this.socialTokenRepo.updateByUserIdAndPlateform(
        { platform, userId },
        { lastUsed: new Date().toISOString() }
      );
      if (!result.success) {
        this.loggger.error(
          `[updateLastUsed]:️ Failed to update last_used for ${platform}:`,
          result.error,
          { platform, userId }
        );
        throw new Error(`Failed to update last used: ${result.error.message}`);
      }
      return { success: true, data: undefined };
    });
  }

  async deleteToken(
    userId: string,
    platform: SocialPlatform
  ): Promise<Result<void, Error>> {
    return tryCatch(async () => {
      const result = await this.socialTokenRepo.deleteByUserIdAndPlatform(
        userId,
        platform
      );

      if (!result.success) {
        this.loggger.error(
          `[deleteToken]: Error deleting token for ${platform}:`,
          result.error,
          { userId, platform }
        );
        throw new Error(`Failed to delete token: ${result.error.message}`);
      }
      return { success: true, data: undefined };
    });
  }

  async getAllUserTokens(
    userId: string
  ): Promise<Result<SocialToken[], Error>> {
    return tryCatch(async () => {
      const result = await this.socialTokenRepo.findByUserId(userId);

      if (!result.success) {
        this.loggger.error(
          "[getAllUserTokens]: Error fetching user connections:",
          result.error,
          { userId }
        );
        throw new Error(`Failed to fetch connections: ${result.error.message}`);
      }

      const tokens = result.data.map((token) => {
        return {
          ...token,
          accessToken: "[PROTECTED]",
          refreshToken: token.refreshToken ? "[PROTECTED]" : null,
        };
      });

      return {
        success: true,
        data: tokens,
      };
    });
  }

  encryptToken(token: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, "hex"),
      iv
    );
    let encrypted = cipher.update(token, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  decryptToken(encryptedToken: string | null): string {
    if (!encryptedToken) return "";
    try {
      const parts = encryptedToken.split(":");
      if (parts.length !== 3) return encryptedToken;

      const iv = Buffer.from(parts[0], "hex");
      const authTag = Buffer.from(parts[1], "hex");
      const encryptedText = parts[2];

      const decipher = crypto.createDecipheriv(
        ALGORITHM,
        Buffer.from(ENCRYPTION_KEY, "hex"),
        iv
      );
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.loggger.error(
        "[decryptToken]: Failed to decrypt token, returning as is.",
        error,
        { encryptedToken }
      );
      return encryptedToken;
    }
  }
}
