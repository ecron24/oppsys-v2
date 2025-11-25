import { IsoDatetime, UuidSchema } from "src/common/common-schema";
import { z } from "zod";

export const NotificationSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  type: z.enum(["info", "warning", "error", "success", "contact_request"]),
  title: z.string(),
  message: z.string(),
  data: z.record(z.string(), z.any()).optional(),
  expiresAt: IsoDatetime,
  createdAt: IsoDatetime,
  readAt: IsoDatetime.nullable().optional(),
});
export type Notification = z.infer<typeof NotificationSchema>;
