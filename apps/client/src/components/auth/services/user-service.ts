import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";
import type { User } from "../auth-types";
import { toSnakeCase } from "@/lib/to-snake-case";

export const userService = {
  async getMe() {
    return handleApiCall(await honoClient.api.users.me.$get());
  },

  async updateProfile(updates: Partial<User>) {
    return handleApiCall(
      await honoClient.api.users.profile.$put({
        json: updates,
      })
    );
  },

  async exportUserData(user: User) {
    const exportData = toSnakeCase({
      profile: user,
      exportedAt: new Date().toISOString(),
      exportVersion: "1.0",
    });

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `profile_export_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  },
};
