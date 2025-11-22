import { supabase } from "@/lib/supabase";
import { authService } from "./auth-service";
import { toCamelCase } from "@oppsys/shared";

export const tokenManager = {
  getToken: async () => {
    // it doesn't make request into supabase, so yeah great
    // it is called for each request
    const sessionResult = await authService.getSession();

    if (!sessionResult.success) return sessionResult;
    if (!sessionResult.data?.accessToken)
      return {
        success: false,
        error: "No access token found",
        status: 404,
      } as const;

    //  Vérifier si le token n'est pas expiré
    if (sessionResult.data.expiresAt) {
      const expirationTime = sessionResult.data.expiresAt * 1000; // Convertir en millisecondes
      const currentTime = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 minutes de marge

      if (currentTime >= expirationTime - bufferTime) {
        console.warn("⚠️ Token expiré ou proche de l'expiration");
        const refreshResult = await tokenManager.refreshToken();
        if (!refreshResult) return refreshResult;
        if (!refreshResult.data?.accessToken)
          return {
            success: false,
            error: "No access token found",
            status: 404,
          } as const;
        return refreshResult;
      }
    }

    return {
      success: true,
      data: {
        accessToken: sessionResult.data.accessToken,
        expiresAt: sessionResult.data.expiresAt,
      },
    } as const;
  },
  refreshToken: async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("[refreshToken]: ", error);
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: data.session ? toCamelCase(data.session) : null,
      status: 200,
    } as const;
  },
  tokenInHeader: async () => {
    let records: Record<string, string> = {};
    const tokenREsult = await tokenManager.getToken();
    if (tokenREsult.success && tokenREsult.data) {
      records = {
        ...records,
        Authorization: `Bearer ${tokenREsult.data.accessToken}`,
      };
    }
    return records;
  },
};
