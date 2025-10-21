import type { PropsWithChildren } from "react";
import { useAuth } from "../auth/hooks/use-auth";
import { PageLoader } from "../loading";
import { Navigate } from "react-router";
import { routes } from "@/routes";

export function GuestRoute({ children }: GuestRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  // Rediriger vers "/" user connecter
  if (user) {
    return <Navigate to={routes.index()} />;
  }

  return <>{children}</>;
}

type GuestRouteProps = PropsWithChildren;
