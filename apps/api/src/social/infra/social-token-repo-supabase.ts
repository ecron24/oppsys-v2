import type { OppSysSupabaseClient } from "@oppsys/supabase";
import {
  type SocialTokenRepo,
  type SaveTokenResult,
  type FindTokenByUserIdAndPlatformResult,
  type FindTokensByUserIdResult,
  type DeleteTokenResult,
  type UpdateTokenResult,
} from "src/social/domain/social-token-repo";
import type { Logger } from "src/logger/domain/logger";
import { SocialTokenSchema, type SocialToken } from "../domain/social-token";
import { tryCatch } from "src/lib/try-catch";
import { toSnakeCase } from "src/lib/to-snake-case";
import { toCamelCase } from "src/lib/to-camel-case";
import type { SocialPlatform } from "../domain/social-connection";

export class SocialTokenRepoSupabase implements SocialTokenRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async updateByUserIdAndPlateform(
    by: { userId: string; platform: SocialPlatform },
    updateData: Partial<SocialToken>
  ): Promise<UpdateTokenResult> {
    return tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("social_tokens")
        .update(toSnakeCase(updateData))
        .eq("user_id", by.userId)
        .eq("platform", by.platform)
        .select("*")
        .single();

      if (error) {
        this.logger.error(
          `[markTokenInvalid]: Error marking token invalid`,
          error,
          { by }
        );
        throw new Error(`Failed to mark token as invalid: ${error.message}`);
      }
      this.logger.debug(`⚠️ Token marked as invalid for `, { by });

      const mapped = toCamelCase(data) as SocialToken;
      return { success: true, data: SocialTokenSchema.parse(mapped) } as const;
    });
  }

  async upsert(token: Omit<SocialToken, "id">): Promise<SaveTokenResult> {
    return await tryCatch(async () => {
      const { error, data } = await this.supabase
        .from("social_tokens")
        .upsert(toSnakeCase(token), { onConflict: "user_id,platform" })
        .select("*")
        .single();

      if (error) {
        this.logger.error("[save] Failed to save social token", error, {
          token,
        });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("Failed to save social token"),
        } as const;
      }

      const mapped = toCamelCase(data) as SocialToken;
      return { success: true, data: SocialTokenSchema.parse(mapped) } as const;
    });
  }

  async findByUserIdAndPlatform(
    userId: string,
    platform: SocialPlatform
  ): Promise<FindTokenByUserIdAndPlatformResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("social_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("platform", platform)
        .single();

      if (error) {
        this.logger.error(
          "[findByUserIdAndPlatform] Failed to find social token",
          error,
          {
            userId,
            platform,
          }
        );
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("Failed to find social token"),
        } as const;
      }

      if (!data) {
        return { success: true, data: null } as const;
      }

      const mapped = toCamelCase(data) as SocialToken;
      return {
        success: true,
        data: SocialTokenSchema.parse(mapped),
      };
    });
  }

  async findByUserId(userId: string): Promise<FindTokensByUserIdResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("social_tokens")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        this.logger.error(
          "[findByUserId] Failed to find social tokens",
          error,
          { userId }
        );
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("Failed to find social tokens"),
        } as const;
      }

      const mapped = toCamelCase(data) as SocialToken[];
      return {
        success: true,
        data: mapped,
      };
    });
  }

  async deleteByUserIdAndPlatform(
    userId: string,
    platform: SocialPlatform
  ): Promise<DeleteTokenResult> {
    return await tryCatch(async () => {
      const { error } = await this.supabase
        .from("social_tokens")
        .delete()
        .eq("user_id", userId)
        .eq("platform", platform);

      if (error) {
        this.logger.error(
          "[deleteByUserIdAndPlatform] Failed to delete social token",
          error,
          {
            userId,
            platform,
          }
        );
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("Failed to delete social token"),
        } as const;
      }

      return { success: true, data: undefined };
    });
  }
}
