import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";
import type { User } from "../auth-types";

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
};
