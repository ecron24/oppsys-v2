import type { OppSysSupabaseClient } from "@oppsys/supabase";
import type { Notification } from "../domain/notification";
import type {
  NotificationRepo,
  CreateNotificationResult,
} from "../domain/notification-repo";
import { tryCatch } from "src/lib/try-catch";

export class NotificationRepoSupabase implements NotificationRepo {
  constructor(private supabase: OppSysSupabaseClient) {}

  async create(
    notification: Omit<Notification, "id" | "createdAt" | "readAt">
  ): Promise<CreateNotificationResult> {
    return await tryCatch(async () => {
      const { error } = await this.supabase.from("notifications").insert({
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        expires_at: notification.expiresAt,
      });

      if (error) throw error;

      return { success: true as const, data: undefined };
    });
  }
}
