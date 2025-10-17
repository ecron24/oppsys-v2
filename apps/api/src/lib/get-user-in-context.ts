import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { nullableSchema, UuidSchema } from "src/common/common-schema";
import z from "zod";

export function getUserInContext(c: Context) {
  const ctxLike = c;
  const user = ctxLike.get("user");
  if (!user) {
    throw new HTTPException(401, {
      message: "Not token provided",
    });
  }
  return user as UserInContext;
}

export const UserInContextSchema = z.object({
  id: UuidSchema,
  email: nullableSchema(z.email()),
  role: z.string().nullable(),
});

export type UserInContext = z.infer<typeof UserInContextSchema>;
