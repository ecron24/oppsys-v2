import type { OppSysSupabaseClient } from "@oppsys/supabase";
import type { Notification } from "../domain/notification";
import type {
  NotificationRepo,
  CreateNotificationResult,
} from "../domain/notification-repo";
import { tryCatch } from "src/lib/try-catch";
import type { Logger } from "src/logger/domain/logger";
import { toSnakeCase } from "@oppsys/shared";
export class NotificationRepoSupabase implements NotificationRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async create(
    notification: Omit<Notification, "id" | "createdAt" | "readAt">
  ): Promise<CreateNotificationResult> {
    return await tryCatch(async () => {
      const { error } = await this.supabase.from("notifications").insert({
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: toSnakeCase(notification.data || {}),
        expires_at: notification.expiresAt,
      });

      if (error) {
        this.logger.error("[create] :", error, { notification });
        throw error;
      }

      return { success: true as const, data: undefined };
    });
  }
}
