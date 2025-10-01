import type { ApiRouter } from "@oppsys/api";
import { hc } from "hono/client";

export const honoClient = hc<ApiRouter>("http://localhost:3000/");
