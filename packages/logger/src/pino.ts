import {
  pino,
  type Logger,
  type TransportMultiOptions,
  type TransportSingleOptions,
} from "pino";
import { env } from "./env";

const loggersCache = new Map<string, Logger>();
let rootLogger: Logger | null = null;

function buildTransports(isDev: boolean): TransportMultiOptions {
  const transports: TransportMultiOptions = {
    targets: [
      {
        level: "error",
        target: "pino-roll",
        options: {
          file: "./logs/error.log",
          size: "10m",
          frequency: "daily",
          mkdir: true,
        },
      },
      {
        level: "trace",
        target: "pino-roll",
        options: {
          file: "./logs/all.log",
          size: "10m",
          frequency: "daily",
          mkdir: true,
        },
      },
    ],
  };

  // if (isDev) {
  const pinoPretty: TransportSingleOptions = {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
    },
  };
  transports.targets = [...transports.targets, pinoPretty];
  // }

  return transports;
}

function getRootLogger(): Logger {
  if (rootLogger) return rootLogger;

  const isDev = env.NODE_ENV === "dev";
  const transports = buildTransports(isDev);

  rootLogger = pino({
    level: env.PINO_LOG_LEVEL,
    name: "root",
    transport: transports,
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  });

  return rootLogger;
}

export function createLoggerPino(name: string) {
  const cached = loggersCache.get(name);
  if (cached) return cached;

  const root = getRootLogger();

  const child = root.child({ name });
  loggersCache.set(name, child);
  return child;
}
export type Pino = ReturnType<typeof createLoggerPino>;
