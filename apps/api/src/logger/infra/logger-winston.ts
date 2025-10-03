import { createLogger } from "@oppsys/logger";
import type { Logger, MetaLogger } from "../domain/logger";

export class LoggerWinston implements Logger {
  private readonly logger = createLogger();

  info(message: string, metadata?: MetaLogger): void {
    this.logger.info(message, metadata);
  }

  error(message: string, error: Error, metadata?: MetaLogger): void {
    this.logger.error(message, { err: error }, metadata);
  }

  warn(message: string, metadata?: MetaLogger): void {
    this.logger.warn(message, metadata);
  }

  debug(message: string, metadata?: MetaLogger): void {
    this.logger.debug(message, metadata);
  }
}
