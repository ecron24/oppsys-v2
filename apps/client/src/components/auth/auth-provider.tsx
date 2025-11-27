import { useEffect, useMemo, type PropsWithChildren } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "./services/auth-service";
import { userService } from "./services/user-service";
import type { User } from "./auth-types";
import { AuthContext, type AuthContextType } from "./auth-context";
import { queryClient, queryKeys } from "../tanstack-query/query-client";

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: sessionResult, isLoading: sessionLoading } = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: authService.getSession,
    staleTime: Infinity, // no refetch as long as session is valid
  });

  const { data: userResponse, isLoading: userLoading } = useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: async () => {
      const response = await userService.getMe();
      if (!response.success) {
        await authService.signOut();
        return null;
      }
      return response.data;
    },
    enabled: !!sessionResult?.success && !!sessionResult?.data,
    staleTime: 5 * 60 * 1000, // cache 5 min
    retry: false, // don't retry if not authenticated
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.auth.user,
        });
        return;
      }
      queryClient.removeQueries({ queryKey: queryKeys.auth.user });
    });

    return () => subscription.unsubscribe();
  }, []);

  const loading = sessionLoading || userLoading;
  const user: User | null = userResponse ?? null;

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      setUser: (u: User | null) => {
        queryClient.setQueryData([queryKeys.auth.user], u);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

type AuthProviderProps = PropsWithChildren;
