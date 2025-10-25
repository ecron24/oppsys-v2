import { tokenManager } from "@/components/auth/services/token-manager";
import type { ApiRouter } from "@oppsys/api";
import { hc } from "hono/client";

export const honoClient = hc<ApiRouter>("http://localhost:4441/", {
  headers: async () => {
    const records: Record<string, string> = await tokenManager.tokenInHeader();
    return records;
  },
});

// async function main() {
//   const response = await honoClient.api.modules.$get({});
//   console.log(response);
// }
