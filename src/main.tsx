import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import data from '@emoji-mart/data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { init as initEmoji } from 'emoji-mart';
import './index.css';
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LoginPage } from './pages/auth/login';
import { RegisterPage } from './pages/auth/register';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { AppRoot } from './pages/app/app.root';
import { DashboardPage } from './pages/app/dashboard';
import { UserIndexPage } from './pages/app/user/user.index';
import { UserCreatePage } from './pages/app/user/user.create';
import { UserShowPage } from './pages/app/user/user.show';
import { ClientIndexPage } from './pages/app/client/client.index';
import { ClientShowPage } from './pages/app/client/client.show';
import { ClientCreatePage } from './pages/app/client/client.create';
import { TicketIndexPage } from './pages/app/ticket/ticket.index';
import { User, UserSchema } from './schemas/user.schema';
import { Client, ClientSchema } from './schemas/client.schema';
import {
  Ticket,
  TicketAssignment,
  TicketAssignmentSchema,
  TicketTag,
  TicketTagSchema,
  TicketSchema,
} from './schemas/ticket.schema';
import { TicketShowPage } from './pages/app/ticket/ticket.show';
import { TicketTagIndexPage } from './pages/app/ticket-tag/ticket-tag.index';
import { TicketTagShowPage } from './pages/app/ticket-tag/ticket-tag.show';
import { TicketTagCreatePage } from './pages/app/ticket-tag/ticket-tag.create';
import { mockUserRecords } from './mocks/records/user.record';
import { mockClientRecords } from './mocks/records/client.record';
import { mockTicketTagRecords } from './mocks/records/ticket-tag.record';
import { mockTicketRecords } from './mocks/records/ticket.record';
import { ChannelIndexPage } from './pages/app/channel/channel.index';
import { Channel, ChannelSchema } from './schemas/channel.schema';
import { mockChannelRecords } from './mocks/records/channel.record';
import { ChannelCreatePage } from './pages/app/channel/channel.create';
import { ChannelShowPage } from './pages/app/channel/channel.show';
import { loggedInUserQuery } from './queries/logged-in-user.query';
import { mockTicketAssignments } from './mocks/records/ticket-assignment.record';
import { Action, ActionSchema } from './schemas/action.schema';
import { mockActionRecords } from './mocks/records/action.record';
import { mockActionFieldRecords } from './mocks/records/action-field.record';
import { ActionIndexPage } from './pages/app/action/action.index';
import { ActionCreatePage } from './pages/app/action/action.create';
import { ActionShowPage } from './pages/app/action/action.show';
import { ActionField, ActionFieldSchema } from './schemas/action-field.schema';
import { db } from './mocks/records/db';

async function prepare() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await initEmoji({ data });
  const { worker } = await import('./mocks/browser');
  await worker.start();

  // seed dummy data to indexeddb
  let existingUsers: User[] = [];
  const unparsedUsers = await db.users.toArray();

  const existingUsersParsing = UserSchema.array().safeParse(unparsedUsers);

  if (!existingUsersParsing.success || existingUsersParsing.data.length === 0) {
    existingUsers = mockUserRecords;

    await db.users.clear();
    await db.users.bulkAdd(existingUsers);
  } else {
    existingUsers = existingUsersParsing.data;
  }

  let existingChannels: Channel[] = [];
  const unparsedChannels = await db.channels.toArray();

  const existingChannelsParsing = ChannelSchema.array().safeParse(unparsedChannels);

  if (!existingChannelsParsing.success || existingChannelsParsing.data.length === 0) {
    existingChannels = mockChannelRecords;

    await db.channels.clear();
    await db.channels.bulkAdd(existingChannels);
  } else {
    existingChannels = existingChannelsParsing.data;
  }

  let existingClients: Client[] = [];
  const unparsedClients = await db.clients.toArray();

  const existingClientsParsing = ClientSchema.array().safeParse(unparsedClients);
  if (!existingClientsParsing.success || existingClientsParsing.data.length === 0) {
    existingClients = mockClientRecords;

    await db.clients.clear();
    await db.clients.bulkAdd(existingClients);
  } else {
    existingClients = existingClientsParsing.data;
  }

  let existingTicketTags: TicketTag[] = [];
  const unparsedTicketTags = await db.ticket_tags.toArray();

  const existingTicketTagsParsing = TicketTagSchema.array().safeParse(unparsedTicketTags);
  if (!existingTicketTagsParsing.success || existingTicketTagsParsing.data.length === 0) {
    existingTicketTags = mockTicketTagRecords;

    await db.ticket_tags.clear();
    await db.ticket_tags.bulkAdd(existingTicketTags);
  } else {
    existingTicketTags = existingTicketTagsParsing.data;
  }

  let existingTickets: Ticket[] = [];
  const unparsedExistingTickets = await db.tickets.toArray();

  const existingTicketsParsing = TicketSchema.array().safeParse(unparsedExistingTickets);
  if (!existingTicketsParsing.success || existingTicketsParsing.data.length === 0) {
    existingTickets = mockTicketRecords;

    await db.tickets.clear();
    await db.tickets.bulkAdd(existingTickets);
  } else {
    existingTickets = existingTicketsParsing.data;
  }

  let existingTicketAssignments: TicketAssignment[] = [];
  const unparsedExistingTicketAssignments = await db.ticket_assignments.toArray();

  const existingTicketAssignmentsParsing = TicketAssignmentSchema.array().safeParse(
    unparsedExistingTicketAssignments,
  );
  if (
    !existingTicketAssignmentsParsing.success ||
    existingTicketAssignmentsParsing.data.length === 0
  ) {
    existingTicketAssignments = mockTicketAssignments();

    await db.ticket_assignments.clear();
    await db.ticket_assignments.bulkAdd(existingTicketAssignments);
  } else {
    existingTicketAssignments = existingTicketAssignmentsParsing.data;
  }

  let existingActions: Action[] = [];
  const unparsedExistingActions = await db.actions.toArray();

  const actionsParsing = ActionSchema.array().safeParse(unparsedExistingActions);
  if (!actionsParsing.success || actionsParsing.data.length === 0) {
    existingActions = mockActionRecords;

    await db.actions.clear();
    await db.actions.bulkAdd(existingActions);
  } else {
    existingActions = actionsParsing.data;
  }

  let existingActionFields: ActionField[] = [];
  const unparsedActionFields = await db.action_fields.toArray();

  const existingActionFieldsParsing = ActionFieldSchema.array().safeParse(unparsedActionFields);

  if (!existingActionFieldsParsing.success || existingActionFieldsParsing.data.length === 0) {
    existingActionFields = mockActionFieldRecords();

    await db.action_fields.clear();
    await db.action_fields.bulkAdd(existingActionFields);
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
            await loggedInUserQuery().queryFn();

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
            await loggedInUserQuery().queryFn();

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
            path: 'users',
            children: [
              {
                element: <UserIndexPage />,
                loader: UserIndexPage.loader(queryClient),
                index: true,
              },
              {
                path: ':id',
                loader: UserShowPage.loader(queryClient),
                element: <UserShowPage />,
              },
              {
                path: 'create',
                loader: UserCreatePage.loader(),
                element: <UserCreatePage />,
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
            path: 'ticket-tags',
            children: [
              {
                element: <TicketTagIndexPage />,
                loader: TicketTagIndexPage.loader(queryClient),
                index: true,
              },
              {
                path: ':id',
                loader: TicketTagShowPage.loader(queryClient),
                element: <TicketTagShowPage />,
              },
              {
                path: 'create',
                loader: TicketTagCreatePage.loader(),
                element: <TicketTagCreatePage />,
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
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </React.StrictMode>,
    );
  })
  .catch((err) => {
    console.error(err);
  });
