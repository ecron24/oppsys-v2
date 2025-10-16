import { z } from "zod";
import { SocialPlatformSchema } from "./social-connection";
import {
  IsoDatetime,
  nullableSchema,
  StringNullableSchema,
} from "src/common/common-schema";

export const SocialTokenSchema = z.object({
  id: z.string(),
  userId: z.string(),
  platform: SocialPlatformSchema,
  accessToken: z.string(),
  refreshToken: z.string().nullable(),
  expiresAt: nullableSchema(IsoDatetime),
  scopes: z.array(z.string()).nullable(),
  platformUserId: z.string().nullable(),
  platformUsername: StringNullableSchema,
  isValid: z.boolean().nullable(),
  lastUsed: nullableSchema(IsoDatetime),
  createdAt: nullableSchema(IsoDatetime),
  updatedAt: nullableSchema(IsoDatetime),
});

export type SocialToken = z.infer<typeof SocialTokenSchema>;
