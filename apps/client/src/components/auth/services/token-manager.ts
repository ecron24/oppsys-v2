import { authService } from "./auth-service";

type SessionResult = Awaited<ReturnType<typeof authService.getSession>>;
type SessionPromise = ReturnType<typeof authService.getSession>;

class TokenManager {
  private sessionResult: SessionResult | null = null;
  private getSessionPromise: SessionPromise | null = null;

  private async fetchSessionOnce() {
    if (this.getSessionPromise) return this.getSessionPromise;
    this.getSessionPromise = authService.getSession();
    return this.getSessionPromise;
  }

  async getToken() {
    if (this.sessionResult) return this.sessionResult;

    const sessionResult = await this.fetchSessionOnce();
    if (!sessionResult.success) return sessionResult;
    if (!sessionResult.data?.accessToken)
      return {
        success: false,
        error: "No access token found",
        status: 404,
      } as const;

    this.sessionResult = sessionResult;

    return {
      success: true,
      data: {
        accessToken: sessionResult.data.accessToken,
        expiresAt: sessionResult.data.expiresAt,
      },
    } as const;
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
