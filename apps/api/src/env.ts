import z from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().min(1),
  SUPABASE_SERVICE_ROLE: z.string().min(1),
  NODE_ENV: z.enum(["dev", "prod", "test"]),
  CORS_ORIGINS: z
    .string()
    .default(
      "http://localhost:3000,http://localhost:5173,http://localhost:4173"
    ),
  N8N_WEBHOOK_AUTH_USER: z.string().min(1),
  N8N_WEBHOOK_AUTH_PASS: z.string().min(1),
  OAUTH_TOKEN_ENCRYPTION_KEY: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  API_BASE_URL: z.string().min(1),
});

export const env = envSchema.parse(process.env);
