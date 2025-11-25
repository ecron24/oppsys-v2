import { authService } from "./auth-service";

type SessionResult = Awaited<ReturnType<typeof authService.getSession>>;
type SessionPromise = Awaited<typeof authService.getSession>;
type RefreshSessionPromise = Awaited<typeof authService.refreshSession>;

class TokenManager {
  private sessionResult: SessionResult | null = null;
  private getSessionPromise: SessionPromise | null = null;
  private refreshPromise: RefreshSessionPromise | null = null;

  private async fetchSessionOnce() {
    if (this.getSessionPromise) return this.getSessionPromise;
    this.getSessionPromise = authService.getSession;
    return this.getSessionPromise;
  }

  private async fetchRefreshOnce() {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = authService.refreshSession;
    return this.refreshPromise;
  }

  async getToken() {
    if (this.sessionResult) return this.sessionResult;

    const sessionPromiseCache = await this.fetchSessionOnce();
    const sessionResult = await sessionPromiseCache();

    if (!sessionResult.success) return sessionResult;
    if (!sessionResult.data?.accessToken)
      return {
        success: false,
        error: "No access token found",
        status: 404,
      } as const;

    this.sessionResult = sessionResult;

    //  Vérifier si le token n'est pas expiré
    if (sessionResult.data.expiresAt) {
      const expirationTime = sessionResult.data.expiresAt * 1000; // Convertir en millisecondes
      const currentTime = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 minutes de marge

      if (currentTime >= expirationTime - bufferTime) {
        console.warn("⚠️ Token expiré ou proche de l'expiration");
        const refreshSessionCache = await tokenManager.refreshToken();
        const refreshResult = await refreshSessionCache();
        if (!refreshResult) return refreshResult;
        if (!refreshResult.data?.accessToken)
          return {
            success: false,
            error: "No access token found",
            status: 404,
          } as const;

        this.sessionResult = refreshResult;
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
  }

  async refreshToken() {
    const res = await this.fetchRefreshOnce();
    return res;
  }

  async tokenInHeader() {
    const records: Record<string, string> = {};
    const tokenResult = await this.getToken();
    if (tokenResult?.success && tokenResult.data?.accessToken) {
      return {
        ...records,
        Authorization: `Bearer ${tokenResult.data.accessToken}`,
      };
    }
    return records;
  }

  clearCache() {
    this.sessionResult = null;
    this.getSessionPromise = null;
    this.refreshPromise = null;
  }
}

export const tokenManager = new TokenManager();
