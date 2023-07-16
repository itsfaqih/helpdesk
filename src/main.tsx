import React from "react";
import ReactDOM from "react-dom/client";
import localforage from "localforage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { LoginPage } from "./pages/auth/login";
import { RegisterPage } from "./pages/auth/register";
import { ForgotPasswordPage } from "./pages/auth/forgot-password";
import { DashboardRoot } from "./pages/dashboard/dashboard.root";
import { DashboardOverviewPage } from "./pages/dashboard/overview.dashboard";
import { AdminIndexPage } from "./pages/admin/admin.index";

async function prepare() {
  const { worker } = await import("./mocks/browser");
  await worker.start();
}

prepare()
  .then(() => {
    const queryClient = new QueryClient();

    const router = createBrowserRouter([
      {
        path: "auth",
        async loader() {
          const unparsedCurrentAdmin = await localforage.getItem(
            "current_admin"
          );

          if (unparsedCurrentAdmin) {
            return redirect("/");
          }

          return null;
        },
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "register",
            element: <RegisterPage />,
          },
          {
            path: "forgot-password",
            element: <ForgotPasswordPage />,
          },
        ],
      },
      {
        path: "/",
        async loader() {
          const unparsedCurrentAdmin = await localforage.getItem(
            "current_admin"
          );

          if (!unparsedCurrentAdmin) {
            return redirect("/auth/login");
          }

          return null;
        },
        element: <DashboardRoot />,
        children: [
          {
            element: <DashboardOverviewPage />,
            index: true,
          },
          {
            path: "admins",
            children: [
              {
                element: <AdminIndexPage />,
                loader: AdminIndexPage.loader(queryClient),
                index: true,
              },
            ],
          },
        ],
      },
    ]);

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <AnimatePresence>
            <RouterProvider router={router} />
          </AnimatePresence>
        </QueryClientProvider>
      </React.StrictMode>
    );
  })
  .catch((err) => {
    console.error(err);
  });
