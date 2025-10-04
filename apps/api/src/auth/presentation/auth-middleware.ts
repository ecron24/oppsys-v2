import { createMiddleware } from "hono/factory";
import { getContext } from "src/get-context";

const { logger, authRepo, profileRepo } = getContext();

export const authenticateToken = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("authorization") || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    return c.json({ success: false, error: "No token provided" }, 401);
  }

  let userId: string | undefined;

  try {
    // Validate token via AuthRepo
    const userResult = await authRepo.getUserByToken(token);
    if (!userResult.success) {
      logger.error("Token invalide:", userResult.error, { token });
      return c.json({ success: false, error: "Invalid token" }, 403);
    }
    userId = userResult.data.id;

    // Fetch full user profile including plan via ProfileRepo
    const profileRes = await profileRepo.getByIdWithPlan(userId);
    if (!profileRes.success) {
      logger.error("User profile not found for token:", profileRes.error, {
        userId,
        profileError: profileRes.error,
      });
      return c.json(
        {
          success: false,
          error: "User not found or invalid token",
          details: { userId, error: profileRes.error.message },
        },
        401
      );
    }

    // Prepare user object for downstream handlers
    const profile = profileRes.data;
    const user = {
      ...profile,
      plan_name: profile.plans?.name || "Free",
    } as Record<string, unknown>;
    const { plan, ...userClean } = user;

    // Attach to Hono context state
    c.set("user", userClean);
    c.set("userId", userId);

    return await next();
  } catch (error: unknown) {
    const normalized =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Erreur inattendue dans authenticateToken:", normalized);
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
