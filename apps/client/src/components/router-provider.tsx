import { SearchPage } from "@/app/search/search-page";
import { createBrowserRouter } from "react-router";
import { RouterProvider as RouterDomProvider } from "react-router/dom";
import { AuthenticatedRoute } from "./guard/authenticated-route";
import { HomePage } from "@/app/home-page";
import { routes } from "@/routes";
import { GuestRoute } from "./guard/guest-route";
import { LoginPage } from "@/app/(auth)/login/login-page";
import { OtpPage } from "@/app/(auth)/otp/otp-page";
import { RegisterPage } from "@/app/(auth)/register/register-page";
import { DashboardPage } from "@/app/(sidebar)/dashboard/dashboard-page";
import { ModulesPage } from "@/app/(sidebar)/modules/modules-page";
import { SidebarLayout } from "@/app/(sidebar)/sidebar-layout";
import { ContentPage } from "@/app/(sidebar)/content/content-page";
import { BillingPage } from "@/app/(sidebar)/billing/billing-page";
import { ProfilePage } from "@/app/(sidebar)/profile/profile-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthenticatedRoute>
        <SidebarLayout />
      </AuthenticatedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: routes.dashboard.index(), element: <DashboardPage /> },
      { path: routes.modules.index(), element: <ModulesPage /> },
      { path: routes.content.index(), element: <ContentPage /> },
      { path: routes.billing.index(), element: <BillingPage /> },
      { path: routes.profile.index(), element: <ProfilePage /> },
    ],
  },
  {
    path: routes.auth.register(),
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
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
