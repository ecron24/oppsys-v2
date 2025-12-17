import { tokenManager } from "@/components/auth/services/token-manager";
import { env } from "@/env";
import type { ApiRouter } from "@oppsys/api";
import { hc } from "hono/client";

export const honoClient = hc<ApiRouter>(env.VITE_API_URL, {
  headers: async () => {
    const records: Record<string, string> = await tokenManager.tokenInHeader();
    return records;
  },
});

// async function main() {
//   const response = await honoClient.api.modules.$get({});
//   console.log(response);
// }
