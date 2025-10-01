import { env } from "./env";
import winston from "winston";
import util from "util";

export function createLogger() {
  const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  );

  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const stripped = JSON.parse(JSON.stringify(meta));

      const metaStr =
        Object.keys(stripped).length > 0
          ? util.inspect(stripped, { depth: null, colors: true })
          : "";

      return `${timestamp} [${level}]: ${message} ${metaStr}`;
    })
  );

  const logger = winston.createLogger({
    level: env.NODE_ENV === "prod" ? "info" : "debug",
    defaultMeta: { service: "oppsys-api" },
    transports: [
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
        maxsize: 5242880,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: "logs/combined.log",
        maxsize: 5242880,
        maxFiles: 5,
      }),
    ],
  });

  logger.add(
    new winston.transports.Console({
      format: env.NODE_ENV === "prod" ? logFormat : consoleFormat,
    })
  );

  return logger;
}
