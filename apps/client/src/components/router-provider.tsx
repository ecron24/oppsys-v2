import { createBrowserRouter } from "react-router";
import { RouterProvider as RouterDomProvider } from "react-router/dom";
import { AuthenticatedRoute } from "./guard/authenticated-route";
import { routes } from "@/routes";
import { GuestRoute } from "./guard/guest-route";
import { lazy } from "react";
import ModuleIdPage from "@/app/(sidebar)/modules/[id]/module-id-page";

const ProfilePage = lazy(() => import("@/app/(sidebar)/profile/profile-page"));
const DashboardPage = lazy(
  () => import("@/app/(sidebar)/dashboard/dashboard-page")
);
const ModulesPage = lazy(() => import("@/app/(sidebar)/modules/modules-page"));
const ContentPage = lazy(() => import("@/app/(sidebar)/content/content-page"));
const BillingPage = lazy(() => import("@/app/(sidebar)/billing/billing-page"));
const LoginPage = lazy(() => import("@/app/(auth)/login/login-page"));
const OtpPage = lazy(() => import("@/app/(auth)/otp/otp-page"));
const HomePage = lazy(() => import("@/app/home-page"));
const RegisterPage = lazy(() => import("@/app/(auth)/register/register-page"));
const SearchPage = lazy(() => import("@/app/search/search-page"));
const SidebarLayout = lazy(() => import("@/app/(sidebar)/sidebar-layout"));
const CompleteProfilePage = lazy(
  () => import("@/app/(sidebar)/complete-profile/complete-profile-page")
);

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
      { path: routes.modules.id(":moduleId"), element: <ModuleIdPage /> },
      { path: routes.content.index(), element: <ContentPage /> },
      { path: routes.billing.index(), element: <BillingPage /> },
      { path: routes.profile.index(), element: <ProfilePage /> },
      {
        path: routes.completeProfile.index(),
        element: <CompleteProfilePage />,
      },
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
