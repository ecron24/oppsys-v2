import type { ApiRouter } from "@oppsys/api";
import { hc } from "hono/client";

// TODO: add the access token in header
export const honoClient = hc<ApiRouter>("http://localhost:4441/");

// async function main() {
//   const response = await honoClient.api.modules.$get({});
//   console.log(response);
// }
