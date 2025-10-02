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
});

export const env = envSchema.parse(process.env);
