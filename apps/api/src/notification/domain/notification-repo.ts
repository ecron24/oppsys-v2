import type { Result } from "@oppsys/utils";
import type { Notification } from "./notification";

export type CreateNotificationResult = Result<void, Error, "UNKNOWN_ERROR">;

export interface NotificationRepo {
  create(
    notification: Omit<Notification, "id" | "createdAt" | "readAt">
  ): Promise<CreateNotificationResult>;
}
