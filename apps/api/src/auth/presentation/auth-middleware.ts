import { createMiddleware } from "hono/factory";
import { type OppSysContext } from "src/get-context";
import type { UserInContext } from "src/lib/get-user-in-context";

type Config = {
  skipUrls?: string[];
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const authenticateToken = (
  ctx: OppSysContext,
  { skipUrls = [] }: Config = {}
) => {
  const skipRegex = skipUrls.map((raw) => {
    // should start with '/'
    const pattern = raw.startsWith("/") ? raw : "/" + raw;

    if (pattern.endsWith("/*")) {
      const base = pattern.slice(0, -2); // retirer '/*'
      return new RegExp("^" + escapeRegex(base) + "(?:/.*)?$");
    }

    // Remplace chaque '*' (wildcard) par '.*' tout en échappant les autres caractères
    // Exemple: "/public/*.css" -> "^/public/.*\.css$"
    const regexStr = "^" + pattern.split("*").map(escapeRegex).join(".*") + "$";
    return new RegExp(regexStr);
  });

  return createMiddleware(async (c, next) => {
    if (skipRegex.some((r) => r.test(c.req.path))) {
      return await next();
    }

    const authHeader = c.req.header("authorization") || "";
    const token = authHeader.split(" ")[1];

    if (!token) {
      return c.json({ success: false, error: "No token provided" }, 401);
    }

    let userId: string | undefined;

    try {
      const userResult = await ctx.authRepo.getUserByToken(token);
      if (!userResult.success) {
        ctx.logger.error("Token invalide:", userResult.error, { token });
        return c.json({ success: false, error: "Invalid token" }, 403);
      }
      userId = userResult.data.id;

      const profileRes = await ctx.profileRepo.getByIdWithPlan(userId);
      if (!profileRes.success) {
        ctx.logger.error(
          "User profile not found for token:",
          profileRes.error,
          {
            userId,
            profileError: profileRes.error,
          }
        );
        return c.json(
          {
            success: false,
            error: "User not found or invalid token",
            details: { userId, error: profileRes.error.message },
          },
          401
        );
      }

      const profile = profileRes.data;
      const user = {
        ...profile,
        plan_name: profile.plans?.name || "Free",
      };
      const userInContext: UserInContext = {
        id: user.id,
        email: user.email,
      };

      // Attach to Hono context state
      c.set("user", userInContext);
      c.set("userId", userId);

      return await next();
    } catch (error: unknown) {
      const normalized =
        error instanceof Error ? error : new Error(String(error));
      ctx.logger.error("Erreur inattendue dans authenticateToken:", normalized);
      return c.json(
        {
          success: false,
          error: "Authentication service error",
          details: normalized.message,
        },
        500
      );
    }
  });
};
