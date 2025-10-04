export interface Logger {
  info(message: string, metadata?: MetaLogger): void;
  error(message: string, error: Error, metadata?: MetaLogger): void;
  warn(message: string, metadata?: MetaLogger): void;
  debug(message: string, metadata?: MetaLogger): void;
}
export type MetaLogger = Record<string, unknown>;
