import type { Result } from "@oppsys/types";
import * as crypto from "crypto";
import { toCamelCase } from "src/lib/to-camel-case";
import { tryCatch } from "src/lib/try-catch";
import type { SocialProviderTokenData } from "./providers/social-provider";
import type { SocialTokenRecord, UserProfile } from "./social-type";
import type { SocialPlatform } from "src/social/domain/social-connection";
import { ProviderFactory } from "./social-provider-factory";
import type { OppSysSupabaseClient } from "@oppsys/supabase";
import type { Logger } from "src/logger/domain/logger";

const ENCRYPTION_KEY = process.env.OAUTH_TOKEN_ENCRYPTION_KEY!;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error(
    "OAUTH_TOKEN_ENCRYPTION_KEY must be defined and be at least 32 characters long."
  );
}
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

type SaveTokenParams = {
  userId: string;
  platform: string;
  tokenData: SocialProviderTokenData;
  profileData: UserProfile;
};

export class SocialTokenManager {
  constructor(
    private supabase: OppSysSupabaseClient,
    private loggger: Logger
  ) {}

  async saveToken({
    platform,
    profileData,
    tokenData,
    userId,
  }: SaveTokenParams): Promise<Result<SocialTokenRecord, Error>> {
    return tryCatch(async () => {
      const tokenRecord = {
        user_id: userId,
        platform: platform,
        access_token: this.encryptToken(tokenData.accessToken),
        refresh_token: tokenData.refreshToken
          ? this.encryptToken(tokenData.refreshToken)
          : null,
        expires_at: tokenData.expiresAt
          ? new Date(tokenData.expiresAt).toISOString()
          : null,
        scopes: tokenData.scope
          ? tokenData.scope
              .replace(/,/g, " ")
              .split(" ")
              .filter((s) => s)
          : [],
        platform_user_id: profileData.id,
        platform_username: profileData.username,
        is_valid: true,
        last_used: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("social_tokens")
        .upsert(tokenRecord, { onConflict: "user_id,platform" })
        .select()
        .single();

      if (error) throw new Error(`Failed to save token: ${error.message}`);

      return {
        success: true,
        data: toCamelCase(data) as SocialTokenRecord,
      };
    });
  }

  async getToken(
    userId: string,
    platform: string
  ): Promise<Result<SocialTokenRecord | null, Error>> {
    return tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("social_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("platform", platform)
        .single();

      if (error) {
        if (error.code === "PGRST116") return { success: true, data: null };
        throw new Error(`Failed to get token: ${error.message}`);
      }

      const camelData = toCamelCase(data) as SocialTokenRecord;

      return {
        success: true,
        data: {
          ...camelData,
          accessToken: this.decryptToken(data.access_token),
          refreshToken: data.refresh_token
            ? this.decryptToken(data.refresh_token)
            : null,
        },
      };
    });
  }

  async getValidToken(
    userId: string,
    platform: string
  ): Promise<Result<SocialTokenRecord, Error>> {
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
            platform as SocialPlatform
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

  /**
   * Rafraîchir un token
   */
  async refreshToken(
    userId: string,
    platform: SocialPlatform
  ): Promise<Result<SocialTokenRecord>> {
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
    platform: string
  ): Promise<Result<void, Error>> {
    return tryCatch(async () => {
      const { error } = await this.supabase
        .from("social_tokens")
        .update({ is_valid: false })
        .eq("user_id", userId)
        .eq("platform", platform);

      if (error) {
        this.loggger.error(
          `[markTokenInvalid]: Error marking token invalid for ${platform}:`,
          error,
          { platform, userId }
        );
        throw new Error(`Failed to mark token as invalid: ${error.message}`);
      }
      this.loggger.debug(`⚠️ Token marked as invalid for ${platform}`);
      return { success: true, data: undefined };
    });
  }

  async updateLastUsed(
    userId: string,
    platform: string
  ): Promise<Result<void, Error>> {
    return tryCatch(async () => {
      const { error } = await this.supabase
        .from("social_tokens")
        .update({ last_used: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("platform", platform);
      if (error) {
        this.loggger.error(
          `[updateLastUsed]:️ Failed to update last_used for ${platform}:`,
          error,
          { platform, userId }
        );
        throw new Error(`Failed to update last used: ${error.message}`);
      }
      return { success: true, data: undefined };
    });
  }

  async deleteToken(
    userId: string,
    platform: string
  ): Promise<Result<void, Error>> {
    return tryCatch(async () => {
      const { error } = await this.supabase
        .from("social_tokens")
        .delete()
        .eq("user_id", userId)
        .eq("platform", platform);

      if (error) {
        this.loggger.error(
          `[deleteToken]: Error deleting token for ${platform}:`,
          error,
          { userId, platform }
        );
        throw new Error(`Failed to delete token: ${error.message}`);
      }
      return { success: true, data: undefined };
    });
  }

  async getAllUserTokens(
    userId: string
  ): Promise<Result<SocialTokenRecord[], Error>> {
    return tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("social_tokens")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        this.loggger.error(
          "[getAllUserTokens]: Error fetching user connections:",
          error,
          { userId }
        );
        throw new Error(`Failed to fetch connections: ${error.message}`);
      }

      const tokens = data.map((token) => {
        const camelToken = toCamelCase(token) as SocialTokenRecord;
        return {
          ...camelToken,
          accessToken: "[PROTECTED]",
          refreshToken: token.refresh_token ? "[PROTECTED]" : null,
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
