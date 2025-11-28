import { authService } from "./auth-service";

type SessionResult = Awaited<ReturnType<typeof authService.getSession>>;
type SessionPromise = ReturnType<typeof authService.getSession>;
type SessionSuccess = Extract<SessionResult, { success: true }>;

class TokenManager {
  private sessionResult: SessionResult | null = null;
  private getSessionPromise: SessionPromise | null = null;

  private async fetchSessionOnce() {
    if (this.getSessionPromise) return this.getSessionPromise;
    this.getSessionPromise = authService.getSession();
    return this.getSessionPromise;
  }

  async getToken() {
    if (this.sessionResult && this.sessionResult.success)
      return this.verifyExpired(this.sessionResult);

    const sessionResult = await this.fetchSessionOnce();
    if (!sessionResult.success) return sessionResult;
    if (!sessionResult.data?.accessToken)
      return {
        success: false,
        error: "No access token found",
        status: 404,
      } as const;

    const sessionVerifiedResult = await this.verifyExpired(sessionResult);
    if (!sessionVerifiedResult.success) return sessionVerifiedResult;
    if (!sessionVerifiedResult.data)
      return {
        success: false,
        error: "No session found",
        status: 404,
      } as const;

    this.sessionResult = sessionVerifiedResult;
    return {
      success: true,
      data: {
        accessToken: sessionVerifiedResult.data.accessToken,
        expiresAt: sessionVerifiedResult.data.expiresAt,
      },
    } as const;
  }

  async verifyExpired(sessionResult: SessionSuccess) {
    if (!sessionResult.data?.accessToken)
      return {
        success: false,
        error: "No access token found",
        status: 404,
      } as const;

    if (!sessionResult.data.expiresAt) {
      return {
        success: false,
        error: "No expiresAt token found",
        status: 404,
      } as const;
    }

    //  Vérifier si le token n'est pas expiré
    const expirationTime = sessionResult.data.expiresAt * 1000; // Convertir en millisecondes
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes de marge

    if (currentTime >= expirationTime - bufferTime) {
      console.warn("⚠️ Token expiré ou proche de l'expiration, refreshing...");
      // refresh token in background
      authService.refreshSession().then((refreshResult) => {
        if (!refreshResult) return refreshResult;
        if (!refreshResult.data?.accessToken)
          return {
            success: false,
            error: "No access token found",
            status: 404,
          } as const;

        this.sessionResult = refreshResult;
      });
    }
    return sessionResult;
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
  }
}

export const tokenManager = new TokenManager();
