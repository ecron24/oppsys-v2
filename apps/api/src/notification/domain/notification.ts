import { z } from "zod";

export const NotificationSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  type: z.enum(["info", "warning", "error", "success"]),
  title: z.string(),
  message: z.string(),
  data: z.record(z.string(), z.any()).optional(),
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  readAt: z.iso.datetime().nullable().optional(),
});
export type Notification = z.infer<typeof NotificationSchema>;
