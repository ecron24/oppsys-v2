import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const queryKeys = {
  auth: {
    session: ["auth", "session"],
    user: ["auth", "user"],
  },
};
