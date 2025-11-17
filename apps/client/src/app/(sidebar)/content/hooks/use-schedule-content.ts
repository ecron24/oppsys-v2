import { useMutation } from "@tanstack/react-query";
import type { Content } from "../content-types";
import { scheludeService } from "@/components/schelude/schelude-service";

export const useScheduleContent = () => {
  const scheduleContentMutation = useMutation({
    mutationFn: async ({
      executionTime,
      content,
    }: {
      executionTime: string;
      content: Content;
    }) => {
      const response = await scheludeService.scheludeContent({
        content,
        executionTime,
      });

      if (!response.success) {
        return {
          success: false as const,
          error: response.error,
        } as const;
      }

      return {
        success: true as const,
        data: {
          status: "scheduled" as const,
          scheduledAt: executionTime,
        },
      } as const;
    },
  });

  const handleScheduleContent = (args: {
    executionTime: string;
    content: Content;
  }) => scheduleContentMutation.mutateAsync(args);

  return { handleScheduleContent, scheduleContentMutation };
};
