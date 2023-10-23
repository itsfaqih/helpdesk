import React from 'react';
import ReactDOM from 'react-dom/client';
import localforage from 'localforage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import data from '@emoji-mart/data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { init as initEmoji } from 'emoji-mart';
import './index.css';
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import { LoginPage } from './pages/auth/login';
import { RegisterPage } from './pages/auth/register';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { AppRoot } from './pages/app/app.root';
import { DashboardPage } from './pages/app/dashboard';
import { AdminIndexPage } from './pages/app/admin/admin.index';
import { AdminCreatePage } from './pages/app/admin/admin.create';
import { AdminShowPage } from './pages/app/admin/admin.show';
import { ClientIndexPage } from './pages/app/client/client.index';
import { ClientShowPage } from './pages/app/client/client.show';
import { ClientCreatePage } from './pages/app/client/client.create';
import { TicketIndexPage } from './pages/app/ticket/ticket.index';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { Client, ClientSchema } from './schemas/client.schema';
import {
  Ticket,
  TicketAssignment,
  TicketAssignmentSchema,
  TicketCategory,
  TicketCategorySchema,
  TicketSchema,
} from './schemas/ticket.schema';
import { TicketShowPage } from './pages/app/ticket/ticket.show';
import { TicketCategoryIndexPage } from './pages/app/ticket-category/ticket-category.index';
import { TicketCategoryShowPage } from './pages/app/ticket-category/ticket-category.show';
import { TicketCategoryCreatePage } from './pages/app/ticket-category/ticket-category.create';
import { mockAdminRecords } from './mocks/records/admin.record';
import { mockClientRecords } from './mocks/records/client.record';
import { mockTicketCategoryRecords } from './mocks/records/ticket-category.record';
import { mockTicketRecords } from './mocks/records/ticket.record';
import { ChannelIndexPage } from './pages/app/channel/channel.index';
import { Channel, ChannelSchema } from './schemas/channel.schema';
import { mockChannelRecords } from './mocks/records/channel.record';
import { ChannelCreatePage } from './pages/app/channel/channel.create';
import { ChannelShowPage } from './pages/app/channel/channel.show';
import { loggedInAdminQuery } from './queries/logged-in-admin.query';
import { mockTicketAssignments } from './mocks/records/ticket-assignment.record';
import { Action, ActionSchema } from './schemas/action.schema';
import { mockActionRecords } from './mocks/records/action.record';
import { mockActionFieldRecords } from './mocks/records/action-field.record';
import { ActionIndexPage } from './pages/app/action/action.index';
import { ActionCreatePage } from './pages/app/action/action.create';
import { ActionShowPage } from './pages/app/action/action.show';
import { ActionField, ActionFieldSchema } from './schemas/action-field.schema';

async function prepare() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await initEmoji({ data });
  const { worker } = await import('./mocks/browser');
  await worker.start();

  // seed dummy data to indexeddb
  let existingAdmins: Admin[] = [];
  const unparsedAdmins = await localforage.getItem<Admin[]>('admins');

  const existingAdminsParsing = AdminSchema.array().safeParse(unparsedAdmins);

  if (!existingAdminsParsing.success) {
    existingAdmins = mockAdminRecords;

    await localforage.setItem('admins', existingAdmins);
  } else {
    existingAdmins = existingAdminsParsing.data;
  }

  let existingChannels: Channel[] = [];
  const unparsedChannels = await localforage.getItem<Channel[]>('channels');

  const existingChannelsParsing = ChannelSchema.array().safeParse(unparsedChannels);

  if (!existingChannelsParsing.success) {
    existingChannels = mockChannelRecords;

    await localforage.setItem('channels', existingChannels);
  } else {
    existingChannels = existingChannelsParsing.data;
  }

  let existingClients: Client[] = [];
  const unparsedClients = await localforage.getItem<Client[]>('clients');

  const existingClientsParsing = ClientSchema.array().safeParse(unparsedClients);
  if (!existingClientsParsing.success) {
    existingClients = mockClientRecords;

    await localforage.setItem('clients', existingClients);
  } else {
    existingClients = existingClientsParsing.data;
  }

  let existingTicketCategories: TicketCategory[] = [];
  const unparsedTicketCategories = await localforage.getItem<TicketCategory[]>('ticket_categories');

  const existingTicketCategoriesParsing =
    TicketCategorySchema.array().safeParse(unparsedTicketCategories);
  if (!existingTicketCategoriesParsing.success) {
    existingTicketCategories = mockTicketCategoryRecords;

    await localforage.setItem('ticket_categories', existingTicketCategories);
  } else {
    existingTicketCategories = existingTicketCategoriesParsing.data;
  }

  let existingTickets: Ticket[] = [];
  const unparsedExistingTickets = await localforage.getItem('tickets');

  const existingTicketsParsing = TicketSchema.array().safeParse(unparsedExistingTickets);
  if (!existingTicketsParsing.success) {
    existingTickets = mockTicketRecords;

    await localforage.setItem('tickets', existingTickets);
  } else {
    existingTickets = existingTicketsParsing.data;
  }

  let existingTicketAssignments: TicketAssignment[] = [];
  const unparsedExistingTicketAssignments = await localforage.getItem('ticket_assignments');

  const existingTicketAssignmentsParsing = TicketAssignmentSchema.array().safeParse(
    unparsedExistingTicketAssignments,
  );
  if (!existingTicketAssignmentsParsing.success) {
    existingTicketAssignments = mockTicketAssignments();

    await localforage.setItem('ticket_assignments', existingTicketAssignments);
  } else {
    existingTicketAssignments = existingTicketAssignmentsParsing.data;
  }

  let existingActions: Action[] = [];
  const unparsedExistingActions = await localforage.getItem('actions');

  const actionsParsing = ActionSchema.array().safeParse(unparsedExistingActions);
  if (!actionsParsing.success) {
    existingActions = mockActionRecords;

    await localforage.setItem('actions', existingActions);
  } else {
    existingActions = actionsParsing.data;
  }

  let existingActionFields: ActionField[] = [];
  const unparsedActionFields = await localforage.getItem('action_fields');

  const existingActionFieldsParsing = ActionFieldSchema.array().safeParse(unparsedActionFields);

  if (!existingActionFieldsParsing.success) {
    existingActionFields = mockActionFieldRecords();

    await localforage.setItem('action_fields', existingActionFields);
  } else {
    existingActionFields = existingActionFieldsParsing.data;
  }
}

prepare()
  .then(() => {
    const queryClient = new QueryClient();

    const router = createBrowserRouter([
      {
        path: 'auth',
        async loader() {
          try {
            await loggedInAdminQuery().queryFn();

            return redirect('/');
          } catch (error) {
            return null;
          }
        },
        children: [
          {
            path: 'login',
            element: <LoginPage />,
            loader: LoginPage.loader(),
          },
          {
            path: 'register',
            element: <RegisterPage />,
            loader: RegisterPage.loader(),
          },
          {
            path: 'forgot-password',
            element: <ForgotPasswordPage />,
            loader: ForgotPasswordPage.loader(),
          },
        ],
      },
      {
        path: '/',
        async loader() {
          try {
            await loggedInAdminQuery().queryFn();

            return null;
          } catch (error) {
            return redirect('/auth/login');
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
            path: 'actions',
            children: [
              {
                element: <ActionIndexPage />,
                loader: ActionIndexPage.loader(queryClient),
                index: true,
              },
              {
                path: ':id',
                element: <ActionShowPage />,
                loader: ActionShowPage.loader(queryClient),
              },
              {
                path: 'create',
                element: <ActionCreatePage />,
                loader: ActionCreatePage.loader(),
              },
            ],
          },
          {
            path: 'admins',
            children: [
              {
                element: <AdminIndexPage />,
                loader: AdminIndexPage.loader(queryClient),
                index: true,
              },
              {
                path: ':id',
                loader: AdminShowPage.loader(queryClient),
                element: <AdminShowPage />,
              },
              {
                path: 'create',
                loader: AdminCreatePage.loader(),
                element: <AdminCreatePage />,
              },
            ],
          },
          {
            path: 'clients',
            children: [
              {
                element: <ClientIndexPage />,
                loader: ClientIndexPage.loader(queryClient),
                index: true,
              },
              {
                path: ':id',
                loader: ClientShowPage.loader(queryClient),
                element: <ClientShowPage />,
              },
              {
                path: 'create',
                loader: ClientCreatePage.loader(),
                element: <ClientCreatePage />,
              },
            ],
          },
          {
            path: 'channels',
            children: [
              {
                element: <ChannelIndexPage />,
                loader: ChannelIndexPage.loader(queryClient),
                index: true,
              },
              {
                path: ':id',
                loader: ChannelShowPage.loader(queryClient),
                element: <ChannelShowPage />,
              },
              {
                path: 'create',
                loader: ChannelCreatePage.loader(),
                element: <ChannelCreatePage />,
              },
            ],
          },
          {
            path: 'tickets',
            children: [
              {
                element: <TicketIndexPage />,
                loader: TicketIndexPage.loader(queryClient),
                index: true,
              },
              {
                path: ':id',
                loader: TicketShowPage.loader(queryClient),
                element: <TicketShowPage />,
              },
            ],
          },
          {
            path: 'ticket-categories',
            children: [
              {
                element: <TicketCategoryIndexPage />,
                loader: TicketCategoryIndexPage.loader(queryClient),
                index: true,
              },
              {
                path: ':id',
                loader: TicketCategoryShowPage.loader(queryClient),
                element: <TicketCategoryShowPage />,
              },
              {
                path: 'create',
                loader: TicketCategoryCreatePage.loader(),
                element: <TicketCategoryCreatePage />,
              },
            ],
          },
        ],
      },
    ]);

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </React.StrictMode>,
    );
  })
  .catch((err) => {
    console.error(err);
  });
