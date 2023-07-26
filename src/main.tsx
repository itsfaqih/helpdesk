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
import { Admin } from "./schemas/admin.schema";
import { Client } from "./schemas/client.schema";
import {
  TicketCategory,
  TicketWithRelationsSchema,
} from "./schemas/ticket.schema";
import { TicketShowPage } from "./pages/app/ticket/ticket.show";
import { TicketCategoryIndexPage } from "./pages/app/ticket-categories/ticket-categories.index";
import { TicketCategoryShowPage } from "./pages/app/ticket-categories/ticket-categories.show";
import { TicketCategoryCreatePage } from "./pages/app/ticket-categories/ticket-categories.create";
import { mockAdminRecords } from "./mocks/records/admin.record";
import { mockClientRecords } from "./mocks/records/client.record";
import { mockTicketCategoryRecords } from "./mocks/records/ticket-category.record";
import { mockTicketRecords } from "./mocks/records/ticket.record";

async function prepare() {
  const { worker } = await import("./mocks/browser");
  await worker.start();

  // seed dummy data to indexeddb
  let existingAdmins = await localforage.getItem<Admin[]>("admins");
  if (!existingAdmins) {
    existingAdmins = mockAdminRecords;

    await localforage.setItem("admins", existingAdmins);
  }

  let existingClients = await localforage.getItem<Client[]>("clients");
  if (!existingClients) {
    existingClients = mockClientRecords;

    await localforage.setItem("clients", existingClients);
  }

  let existingTicketCategories = await localforage.getItem<TicketCategory[]>(
    "ticket_categories"
  );

  if (!existingTicketCategories) {
    existingTicketCategories = mockTicketCategoryRecords;

    await localforage.setItem("ticket_categories", existingTicketCategories);
  }

  let existingTickets: TicketWithRelationsSchema[] = [];
  const unparsedExistingTickets = await localforage.getItem("tickets");

  const existingTicketsParsing = TicketWithRelationsSchema.array().safeParse(
    unparsedExistingTickets
  );
  if (!existingTicketsParsing.success) {
    existingTickets = mockTicketRecords;

    await localforage.setItem("tickets", existingTickets);
  } else {
    existingTickets = existingTicketsParsing.data;
  }
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
            loader: LoginPage.loader(),
          },
          {
            path: "register",
            element: <RegisterPage />,
            loader: RegisterPage.loader(),
          },
          {
            path: "forgot-password",
            element: <ForgotPasswordPage />,
            loader: ForgotPasswordPage.loader(),
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
            loader: DashboardPage.loader(),
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
                loader: AdminCreatePage.loader(),
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
                loader: ClientCreatePage.loader(),
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
              {
                path: ":id",
                loader: TicketShowPage.loader(queryClient),
                element: <TicketShowPage />,
              },
            ],
          },
          {
            path: "ticket-categories",
            children: [
              {
                element: <TicketCategoryIndexPage />,
                loader: TicketCategoryIndexPage.loader(queryClient),
                index: true,
              },
              {
                path: ":id",
                loader: TicketCategoryShowPage.loader(queryClient),
                element: <TicketCategoryShowPage />,
              },
              {
                path: "create",
                loader: TicketCategoryCreatePage.loader(),
                element: <TicketCategoryCreatePage />,
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
