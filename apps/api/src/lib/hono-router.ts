import type { Hono } from "hono";
import { getContext, type OppSysContext } from "src/get-context";

export function honoRouter<H extends Hono>(
  callback: (ctx: OppSysContext) => H
): H {
  const context = getContext();
  return callback(context);
}
