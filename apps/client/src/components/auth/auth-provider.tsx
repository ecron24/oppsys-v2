import { useState, useEffect, type PropsWithChildren } from "react";
import { authService } from "./services/auth-service";
import { userService } from "./services/user-service";
import type { User } from "./types";
import { AuthContext, type AuthContextType } from "./auth-context";

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFullUserProfile = async (): Promise<void> => {
    const response = await userService.getMe();
    if (response.success) {
      setUser(response.data);
    } else {
      await authService.signOut();
      setUser(null);
    }
  };

  const initialSession = async (): Promise<void> => {
    const resultSession = await authService.getSession();
    if (!resultSession.success) {
      console.error("Session error:", resultSession);
      setLoading(false);
      return;
    }
    if (resultSession.data) {
      fetchFullUserProfile();
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = authService.onAuthStateChange((_, session) => {
      if (session?.user) {
        if (!user || user.id !== session.user.id) {
          setLoading(true);
          fetchFullUserProfile();
          return;
        }
      }
      setUser(null);
      setLoading(false);
    });

    initialSession();

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

type AuthProviderProps = PropsWithChildren;
