import type { User } from "@/components/auth/auth-types";
import { toSnakeCase } from "@/lib/to-snake-case";

export const profileService = {
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
