import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";
import type { Platform, SocialConnection, SocialStats } from "../profile-types";

export const socialService = {
  async initAuth(platform: Platform, redirectUri?: string) {
    const result = await handleApiCall(
      await honoClient.api.social.init.$post({
        json: {
          platform,
          redirectUri: redirectUri || `${window.location.origin}/auth/callback`,
        },
      })
    );

    if (result.success) {
      return result.data.authUrl as string;
    }
    throw new Error(result.error || "Failed to initiate OAuth");
  },

  async getConnections() {
    const result = await handleApiCall(
      await honoClient.api.social.connections.$get({ query: {} })
    );

    if (result.success) {
      return result.data as SocialConnection[];
    }
    throw new Error(result.error || "Failed to fetch connections");
  },

  async getStats(): Promise<SocialStats> {
    const connections = await this.getConnections();

    const valid = connections.filter((c) => c.isValid).length;
    const invalid = connections.filter((c) => !c.isValid).length;
    const expiringSoon = connections.filter((c) => {
      if (!c.expiresAt || !c.isValid) return false;
      const expirationTime = new Date(c.expiresAt).getTime();
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      return now >= expirationTime - sevenDays;
    }).length;

    return {
      valid,
      invalid,
      expiringSoon,
      total: connections.length,
    };
  },

  async disconnect(platform: Platform) {
    return await handleApiCall(
      await honoClient.api.social.connections[":platform"].$delete({
        param: { platform },
        query: { platform },
      })
    );
  },

  async refreshToken(platform: Platform) {
    return await handleApiCall(
      await honoClient.api.social.connections[":platform"].refresh.$post({
        json: { platform },
        param: { platform },
      })
    );
  },

  async checkConnectionStatus(platform: Platform) {
    return await handleApiCall(
      await honoClient.api.social.connections[":platform"].status.$get({
        param: { platform },
        query: { platform },
      })
    );
  },
};
