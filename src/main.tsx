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
import { AppRoot } from "./pages/app/app.root";
import { DashboardPage } from "./pages/app/dashboard";
import { AdminIndexPage } from "./pages/app/admin/admin.index";
import { AdminCreatePage } from "./pages/app/admin/admin.create";
import { AdminShowPage } from "./pages/app/admin/admin.show";
import { ClientIndexPage } from "./pages/app/client/client.index";
import { ClientShowPage } from "./pages/app/client/client.show";
import { ClientCreatePage } from "./pages/app/client/client.create";
import { TicketIndexPage } from "./pages/app/ticket/ticket.index";

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
            "logged_in_admin"
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
            "logged_in_admin"
          );

          if (!unparsedCurrentAdmin) {
            return redirect("/auth/login");
          }

          return null;
        },
        element: <AppRoot />,
        children: [
          {
            element: <DashboardPage />,
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
              {
                path: ":id",
                loader: AdminShowPage.loader(queryClient),
                element: <AdminShowPage />,
              },
              {
                path: "create",
                element: <AdminCreatePage />,
              },
            ],
          },
          {
            path: "clients",
            children: [
              {
                element: <ClientIndexPage />,
                loader: ClientIndexPage.loader(queryClient),
                index: true,
              },
              {
                path: ":id",
                loader: ClientShowPage.loader(queryClient),
                element: <ClientShowPage />,
              },
              {
                path: "create",
                element: <ClientCreatePage />,
              },
            ],
          },
          {
            path: "tickets",
            children: [
              {
                element: <TicketIndexPage />,
                loader: TicketIndexPage.loader(queryClient),
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
