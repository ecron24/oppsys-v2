import { routes } from "@/routes";
import { Navigate } from "react-router";

export function HomePage() {
  return <Navigate to={routes.dashboard.index()} />;
}
