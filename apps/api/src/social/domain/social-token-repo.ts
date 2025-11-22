import type { Result } from "@oppsys/shared";
import type { SocialToken } from "./social-token";
import type { SocialPlatform } from "./social-connection";

export type SaveTokenResult = Result<SocialToken, Error, "UNKNOWN_ERROR">;
export type UpdateTokenResult = Result<
  SocialToken,
  Error,
  "UNKNOWN_ERROR" | "SOCIAL_TOKEN_NOT_FOUND"
>;
export type FindTokenByUserIdAndPlatformResult = Result<
  SocialToken | null,
  Error,
  "UNKNOWN_ERROR"
>;
export type FindTokensByUserIdResult = Result<
  SocialToken[],
  Error,
  "UNKNOWN_ERROR"
>;
export type DeleteTokenResult = Result<void, Error, "UNKNOWN_ERROR">;

export interface SocialTokenRepo {
  upsert(token: Omit<SocialToken, "id">): Promise<SaveTokenResult>;
  updateByUserIdAndPlateform(
    by: { userId: string; platform: SocialPlatform },
    data: Partial<SocialToken>
  ): Promise<UpdateTokenResult>;
  findByUserIdAndPlatform(
    userId: string,
    platform: SocialPlatform
  ): Promise<FindTokenByUserIdAndPlatformResult>;
  findByUserId(userId: string): Promise<FindTokensByUserIdResult>;
  deleteByUserIdAndPlatform(
    userId: string,
    platform: SocialPlatform
  ): Promise<DeleteTokenResult>;
}
