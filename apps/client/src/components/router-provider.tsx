import { HomePage } from "@/app/home-page";
import { SearchPage } from "@/app/search/search-page";
import { createBrowserRouter } from "react-router";
import { RouterProvider as RouterDomProvider } from "react-router/dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
]);

export function RouterProvider() {
  return <RouterDomProvider router={router} />;
}
