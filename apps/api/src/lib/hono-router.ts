import type { Hono } from "hono";
import { getContext, type Context } from "src/get-context";

export function honoRouter<H extends Hono>(callback: (ctx: Context) => H): H {
  const context = getContext();
  return callback(context);
}
