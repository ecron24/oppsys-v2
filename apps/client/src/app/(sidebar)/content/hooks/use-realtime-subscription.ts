import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@oppsys/ui/lib/sonner";
import { contentService } from "@/components/content/content-service";
import type { Content } from "../content-types";
import type { User } from "@/components/auth/auth-types";

export const useRealtimeSubscription = (
  user: User | null,
  updateContent: (contentId: string, updates: Partial<Content>) => void
) => {
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel(`content_changes_${user.id}`);
    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "generated_content",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedContent = payload.new as Content;
          if (updatedContent && updatedContent.userId === user.id) {
            updateContent(updatedContent.id, updatedContent);

            if (
              payload.eventType === "UPDATE" &&
              payload.old.status !== "published" &&
              updatedContent.status === "published"
            ) {
              toast.success(
                `Votre contenu "${contentService.getModuleDisplayName(updatedContent.moduleSlug)}" a été publié !`
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, updateContent]);
};
