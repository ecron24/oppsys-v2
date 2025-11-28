import type { Logger } from "./domain/logger";
import { PinoLogger } from "./infra/pino-logger";

export function createLogger(name: string | string[]): Logger {
  const nameStr = Array.isArray(name) ? name.join("/") : name;
  return new PinoLogger(nameStr);
}
