import z from "zod";

const LogLevelSchema = z.enum([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "prod", "test"]),
  PINO_LOG_LEVEL: LogLevelSchema.catch("info"),
});

export const env = envSchema.parse(process.env);
