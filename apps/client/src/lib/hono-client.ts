import { tokenManager } from "@/components/auth/services/token-manager";
import type { ApiRouter } from "@oppsys/api";
import { hc } from "hono/client";

// TODO: check if the custom header overload the existed, if so that's right
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
