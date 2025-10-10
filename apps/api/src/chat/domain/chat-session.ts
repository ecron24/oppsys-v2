import z from "zod";

export const ChatSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  moduleSlug: z.string(),
  sessionData: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  expiresAt: z.string(),
  lastActivity: z.string().optional(),
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;
