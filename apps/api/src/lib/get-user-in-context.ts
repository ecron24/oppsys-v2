import type { Context } from "hono";
import { nullableSchema } from "src/common/common-schema";
import z from "zod";

export function getUserInContext(c: Context) {
  const ctxLike = c;
  return ctxLike.get("user") as UserInContext;
}

export const UserInContextSchema = z.object({
  id: z.uuid(),
  email: nullableSchema(z.email()),
});

export type UserInContext = z.infer<typeof UserInContextSchema>;
