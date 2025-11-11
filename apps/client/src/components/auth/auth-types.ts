import type { honoClient } from "@/lib/hono-client";
import type { InferResponseType } from "hono";

export type User = InferResponseType<
  typeof honoClient.api.users.me.$get,
  200
>["data"];
