import { createLogger } from "@oppsys/logger";
import type { Logger } from "../domain/logger";

export class LoggerWinston implements Logger {
  private readonly logger = createLogger();

  info(message: string, metadata?: Record<string, unknown>): void {
    this.logger.info(message, metadata);
  }

  error(
    message: string,
    error: Error,
    metadata?: Record<string, unknown>
  ): void {
    this.logger.error(message, { err: error, ...metadata });
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.logger.warn(message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.logger.debug(message, metadata);
  }
}
