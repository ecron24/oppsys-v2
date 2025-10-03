import z from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string().optional(),
  role: z.string(),
  planId: z.string().optional(),
  creditBalance: z.number().optional(),
  language: z.string(),
  timezone: z.string(),
});

export type User = z.infer<typeof UserSchema>;
