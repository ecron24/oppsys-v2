import { env } from "src/env";
import winston from "winston";

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
  })
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === "prod" ? "info" : "debug",
  defaultMeta: { service: "oppsys-api" },
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

if (env.NODE_ENV == "prod") {
  logger.add(
    new winston.transports.Console({
      format: logFormat,
    })
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}
