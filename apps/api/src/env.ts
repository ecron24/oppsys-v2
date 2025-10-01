import z from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().min(1),
  SUPABASE_SERVICE_ROLE: z.string().min(1),
  NODE_ENV: z.enum(["dev", "prod", "test"]),
});

export const env = envSchema.parse(process.env);
