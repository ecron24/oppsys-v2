import z from "zod";

export const SocialPlatformSchema = z.enum([
  "google",
  "facebook",
  "linkedin",
  "instagram",
  "tiktok",
  "twitter",
  "youtube",
]);
export type SocialPlatform = z.infer<typeof SocialPlatformSchema>;

export const ScopeLevelSchema = z.enum(["basic", "advanced"]);
export type ScopeLevel = z.infer<typeof ScopeLevelSchema>;
