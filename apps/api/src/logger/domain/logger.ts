export type MetaLogger = Record<string, unknown>;

export abstract class Logger {
  constructor(protected name = "") {}
  abstract info(message: string, metadata?: MetaLogger): void;
  abstract error(message: string, error: Error, metadata?: MetaLogger): void;
  abstract warn(message: string, metadata?: MetaLogger): void;
  abstract debug(message: string, metadata?: MetaLogger): void;
}
