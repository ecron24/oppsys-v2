import { z } from "zod";

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["info", "warning", "error", "success"]),
  title: z.string(),
  message: z.string(),
  data: z.record(z.string(), z.any()).optional(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().nullable().optional(),
});
export type Notification = z.infer<typeof NotificationSchema>;
