import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";
import type { Platform } from "../social-types";

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
    return result;
  },

  async getConnections() {
    return await handleApiCall(
      await honoClient.api.social.connections.$get({ query: {} })
    );
  },

  async getStats() {
    const connections = await this.getConnections();
    if (!connections.success) return connections;
    const valid = connections.data.filter((c) => c.isValid).length;
    const invalid = connections.data.filter((c) => !c.isValid).length;
    const expiringSoon = connections.data.filter((c) => {
      if (!c.expiresAt || !c.isValid) return false;
      const expirationTime = new Date(c.expiresAt).getTime();
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      return now >= expirationTime - sevenDays;
    }).length;

    return {
      success: true,
      data: {
        valid,
        invalid,
        expiringSoon,
        total: connections.data.length,
      },
    } as const;
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
