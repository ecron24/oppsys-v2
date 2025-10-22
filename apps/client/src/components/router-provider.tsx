import { SearchPage } from "@/app/search/search-page";
import { createBrowserRouter } from "react-router";
import { RouterProvider as RouterDomProvider } from "react-router/dom";
import { AuthenticatedRoute } from "./guard/authenticated-route";
import { SidebarLayout } from "./sidebar-layout";
import { HomePage } from "@/app/home-page";
import { routes } from "@/routes";
import { GuestRoute } from "./guard/guest-route";
import { LoginPage } from "@/app/(auth)/login-page";
import { OtpPage } from "@/app/(auth)/otp/otp-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthenticatedRoute>
        <SidebarLayout />
      </AuthenticatedRoute>
    ),
    children: [{ index: true, element: <HomePage /> }],
  },
  {
    path: routes.auth.login(),
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: routes.auth.otp(),
    element: (
      <GuestRoute>
        <OtpPage />
      </GuestRoute>
    ),
  },
  {
    path: routes.search.index(),
    element: <SearchPage />,
  },
]);

export function RouterProvider() {
  return <RouterDomProvider router={router} />;
}
