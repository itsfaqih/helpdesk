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
  TicketAssigmentWithRelations,
  TicketAssignmentWithRelationsSchema,
  TicketCategory,
  TicketWithRelations,
  TicketWithRelationsSchema,
} from "./schemas/ticket.schema";
import { TicketShowPage } from "./pages/app/ticket/ticket.show";
import { TicketCategoryIndexPage } from "./pages/app/ticket-category/ticket-category.index";
import { TicketCategoryShowPage } from "./pages/app/ticket-category/ticket-category.show";
import { TicketCategoryCreatePage } from "./pages/app/ticket-category/ticket-category.create";
import { mockAdminRecords } from "./mocks/records/admin.record";
import { mockClientRecords } from "./mocks/records/client.record";
import { mockTicketCategoryRecords } from "./mocks/records/ticket-category.record";
import {
  mockTicketAssignments,
  mockTicketRecords,
} from "./mocks/records/ticket.record";
import { ChannelIndexPage } from "./pages/app/channel/channel.index";
import { Channel } from "./schemas/channel.schema";
import { mockChannelRecords } from "./mocks/records/channel.record";
import { ChannelCreatePage } from "./pages/app/channel/channel.create";
import { ChannelShowPage } from "./pages/app/channel/channel.show";
import { loggedInAdminQuery } from "./queries/logged-in-admin.query";

async function prepare() {
  const { worker } = await import("./mocks/browser");
  await worker.start();

  // seed dummy data to indexeddb
  let existingAdmins = await localforage.getItem<Admin[]>("admins");
  if (!existingAdmins) {
    existingAdmins = mockAdminRecords;

    await localforage.setItem("admins", existingAdmins);
  }

  let existingChannels = await localforage.getItem<Channel[]>("channels");
  if (!existingChannels) {
    existingChannels = mockChannelRecords;

    await localforage.setItem("channels", existingChannels);
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

  let existingTickets: TicketWithRelations[] = [];
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

  let existingTicketAssignments: TicketAssigmentWithRelations[] = [];
  const unparsedExistingTicketAssignments = await localforage.getItem(
    "ticket_assignments"
  );

  const existingTicketAssignmentsParsing =
    TicketAssignmentWithRelationsSchema.array().safeParse(
      unparsedExistingTicketAssignments
    );
  if (!existingTicketAssignmentsParsing.success) {
    existingTicketAssignments = mockTicketAssignments;

    await localforage.setItem("ticket_assignments", existingTicketAssignments);
  } else {
    existingTicketAssignments = existingTicketAssignmentsParsing.data;
  }

  const assignedTickets: TicketWithRelations[] = existingTickets.map(
    (ticket) => {
      const ticketAssignments = existingTicketAssignments.filter(
        (ticketAssignment) => ticketAssignment.ticket_id === ticket.id
      );

      return {
        ...ticket,
        assignments: ticketAssignments,
      };
    }
  );

  await localforage.setItem("tickets", assignedTickets);
}

prepare()
  .then(() => {
    const queryClient = new QueryClient();

    const router = createBrowserRouter([
      {
        path: "auth",
        async loader() {
          try {
            await loggedInAdminQuery().queryFn();

            return redirect("/");
          } catch (error) {
            return null;
          }
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
          try {
            await loggedInAdminQuery().queryFn();

            return null;
          } catch (error) {
            return redirect("/auth/login");
          }
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
            path: "channels",
            children: [
              {
                element: <ChannelIndexPage />,
                loader: ChannelIndexPage.loader(queryClient),
                index: true,
              },
              {
                path: ":id",
                loader: ChannelShowPage.loader(queryClient),
                element: <ChannelShowPage />,
              },
              {
                path: "create",
                loader: ChannelCreatePage.loader(),
                element: <ChannelCreatePage />,
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
          <RouterProvider router={router} />
        </QueryClientProvider>
      </React.StrictMode>
    );
  })
  .catch((err) => {
    console.error(err);
  });
