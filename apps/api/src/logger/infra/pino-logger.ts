import { createLoggerPino, type Pino } from "@oppsys/logger";
import { Logger, type MetaLogger } from "../domain/logger";

export class PinoLogger extends Logger {
  private pino: Pino;
  constructor(name: string) {
    super(name);
    this.pino = createLoggerPino(name);
  }

  info(message: string, metadata?: MetaLogger): void {
    this.pino.info(metadata, message);
  }

  error(message: string, error: Error, metadata?: MetaLogger): void {
    this.pino.error({ ...metadata, err: error }, message);
  }

  warn(message: string, metadata?: MetaLogger): void {
    this.pino.warn(metadata, message);
  }

  debug(message: string, metadata?: MetaLogger): void {
    this.pino.debug(metadata, message);
  }
}
