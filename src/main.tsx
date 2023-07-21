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
import { nanoid } from "nanoid";
import { Client } from "./schemas/client.schema";
import { Ticket, TicketCategory } from "./schemas/ticket.schema";
import { TicketShowPage } from "./pages/app/ticket/ticket.show";

async function prepare() {
  const { worker } = await import("./mocks/browser");
  await worker.start();

  // seed dummy data to indexeddb
  let existingAdmins = await localforage.getItem<Admin[]>("admins");
  if (!existingAdmins) {
    existingAdmins = [
      {
        id: nanoid(),
        full_name: "Super Admin",
        email: "superadmin@example.com",
        password: "qwerty123",
        is_active: true,
        role: "super_admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: nanoid(),
        full_name: "Operator",
        email: "operator@example.com",
        password: "qwerty123",
        is_active: true,
        role: "operator",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    await localforage.setItem<Admin[]>("admins", existingAdmins);
  }

  let existingClients = await localforage.getItem<Client[]>("clients");
  if (!existingClients) {
    existingClients = [
      {
        id: nanoid(),
        full_name: "Client 1",
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: nanoid(),
        full_name: "Client 2",
        is_archived: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    await localforage.setItem<Client[]>("clients", existingClients);
  }

  let existingTicketCategories = await localforage.getItem<TicketCategory[]>(
    "ticket_categories"
  );

  if (!existingTicketCategories) {
    existingTicketCategories = [
      {
        id: nanoid(),
        name: "Masalah Pelayanan",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: nanoid(),
        name: "Masalah Menu",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: nanoid(),
        name: "Saran Menu",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: nanoid(),
        name: "Lainnya",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    await localforage.setItem<TicketCategory[]>(
      "ticket_categories",
      existingTicketCategories
    );
  }

  let existingTickets = await localforage.getItem<Ticket[]>("tickets");
  if (!existingTickets) {
    existingTickets = [
      {
        id: nanoid(),
        client_id: existingClients[0].id,
        category_id: existingTicketCategories[0].id,
        title: "Staf kurang ramah",
        description: `Gue mau lapor nih tentang pengalaman gue di Restoran XYZ. Jadi ceritanya, gue tuh nyoba mampir ke restoran itu pada tanggal XX/XX/XXXX, dan wah, bener-bener kecewa deh sama pelayanannya. Stafnya tuh kurang ramah banget, pelayanannya juga lama banget, dan gak jarang pesenan gue dikasih yang salah, gitu loh!\nJadi, beneran deh, gue harap banget masalah ini bisa diatasi dengan serius dan diperbaiki secepatnya. Gue pengen kasih masukan yang membangun biar pengalaman nyokap-nyokap Jakarta Selatan yang lain juga bisa lebih kece di restoran ini.`,
        platform: "Email",
        status: "open",
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: nanoid(),
        client_id: existingClients[0].id,
        category_id: existingTicketCategories[2].id,
        title: "Saran Menu Makanan: Sate Ayam",
        platform: "WhatsApp",
        status: "open",
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: nanoid(),
        client_id: existingClients[1].id,
        category_id: existingTicketCategories[0].id,
        title: "Staf kurang ramah, pelayanan lelet",
        description: `Jadi, ceritanya pas aku kesana tanggal XX/XX/XXXX, aku bener-bener kecewa sama pelayanannya. Stafnya kurang ramah banget, pelayanannya juga lama banget, dan kadang pesenan aku dikasih yang salah, gitu loh!`,
        platform: "Instagram",
        status: "open",
        is_archived: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: nanoid(),
        client_id: existingClients[1].id,
        category_id: existingTicketCategories[1].id,
        title: "Makanannya basi",
        platform: "Twitter",
        status: "open",
        is_archived: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    await localforage.setItem<Ticket[]>("tickets", existingTickets);
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
              {
                path: ":id",
                loader: TicketShowPage.loader(queryClient),
                element: <TicketShowPage />,
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
