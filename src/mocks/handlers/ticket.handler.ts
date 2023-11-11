import { TicketIndexRequestSchema } from '@/queries/ticket.query';
import {
  CreateTicketAssignmentSchema,
  CreateTicketSchema,
  Ticket,
  TicketAssignment,
  TicketAssignmentSchema,
  TicketSchema,
} from '@/schemas/ticket.schema';
import { generatePaginationMeta } from '@/utils/api.util';
import localforage from 'localforage';
import { http } from 'msw';
import { nanoid } from 'nanoid';
import {
  allowAuthenticatedOnly,
  allowSuperAdminOnly,
  handleResponseError,
  successResponse,
} from '../mock-utils';
import { NotFoundError } from '@/utils/error.util';
import { getTicketWithRelationsById, getTicketsWithRelations } from '../records/ticket.record';

export const ticketHandlers = [
  http.post('/api/tickets', async ({ cookies, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const data = CreateTicketSchema.parse(await request.json());

      const unparsedStoredAdmins = (await localforage.getItem('tickets')) ?? [];
      const storedAdmins = TicketSchema.array().parse(unparsedStoredAdmins);

      const newTicket: Ticket = {
        id: nanoid(),
        title: data.title,
        status: 'open',
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_id: data.category_id,
        channel_id: data.channel_id,
        client_id: data.client_id,
      };

      const newTickets = [...storedAdmins, newTicket];

      await localforage.setItem('tickets', newTickets);

      return successResponse({
        data: newTicket,
        message: 'Successfully created ticket',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/tickets', async ({ cookies, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const storedTickets = await getTicketsWithRelations();

      const unparsedFilters = Object.fromEntries(new URL(request.url).searchParams);
      const filters = TicketIndexRequestSchema.parse(unparsedFilters);

      const filteredTickets = storedTickets.filter((ticket) => {
        if (filters.search) {
          const search = filters.search.toLowerCase();

          const isMatched = ticket.title.toLowerCase().includes(search);

          if (!isMatched) {
            return false;
          }
        }

        if (filters.status) {
          if (ticket.status !== filters.status) {
            return false;
          }
        }

        if (filters.category_id) {
          if (ticket.category_id !== filters.category_id) {
            return false;
          }
        }

        if (filters.is_archived) {
          if (filters.is_archived === '1' && !ticket.is_archived) {
            return false;
          } else if (filters.is_archived === '0' && ticket.is_archived) {
            return false;
          }
        } else {
          return ticket.is_archived === false;
        }

        return true;
      });

      const sortedTickets = filteredTickets.sort((a, b) => {
        if (a.updated_at > b.updated_at) {
          return -1;
        } else if (a.updated_at < b.updated_at) {
          return 1;
        } else {
          return 0;
        }
      });

      const page = filters.page ?? 1;

      const paginatedTickets = sortedTickets.slice((page - 1) * 10, page * 10);

      return successResponse({
        data: paginatedTickets,
        message: 'Successfully retrieved tickets',
        meta: {
          ...generatePaginationMeta({
            currentPage: page,
            total: filteredTickets.length,
          }),
        },
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/tickets/:ticketId', async ({ cookies, params }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const ticket = await getTicketWithRelationsById({
        ticketId: params.ticketId as string,
        assignments: {
          withTrash: true,
        },
      });

      return successResponse({
        data: ticket,
        message: 'Successfully retrieved ticket',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/tickets/:ticketId/archive', async ({ cookies, params }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const unparsedStoredTickets = (await localforage.getItem('tickets')) ?? [];
      const storedTickets = TicketSchema.array().parse(unparsedStoredTickets);

      const ticketId = params.ticketId;

      const ticketToUpdate = storedTickets.find((ticket) => ticket.id === ticketId);

      if (!ticketToUpdate) {
        throw new NotFoundError('Ticket is not found');
      }

      const updatedTicket: Ticket = {
        ...ticketToUpdate,
        is_archived: true,
        updated_at: new Date().toISOString(),
      };

      const newTickets = storedTickets.map((ticket) =>
        ticket.id === ticketId ? updatedTicket : ticket,
      );

      await localforage.setItem('tickets', newTickets);

      return successResponse({
        data: updatedTicket,
        message: 'Successfully archived ticket',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/tickets/:ticketId/restore', async ({ cookies, params }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const unparsedStoredTickets = (await localforage.getItem('tickets')) ?? [];
      const storedTickets = TicketSchema.array().parse(unparsedStoredTickets);

      const ticketId = params.ticketId;

      const ticketToUpdate = storedTickets.find((ticket) => ticket.id === ticketId);

      if (!ticketToUpdate) {
        throw new NotFoundError('Ticket is not found');
      }

      const updatedTicket: Ticket = {
        ...ticketToUpdate,
        is_archived: false,
        updated_at: new Date().toISOString(),
      };

      const newTickets = storedTickets.map((ticket) =>
        ticket.id === ticketId ? updatedTicket : ticket,
      );

      await localforage.setItem('tickets', newTickets);

      return successResponse({
        data: updatedTicket,
        message: 'Successfully activated ticket',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.post('/api/tickets/:ticketId/assignments', async ({ cookies, params, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const unparsedStoredTickets = (await localforage.getItem('tickets')) ?? [];
      const storedTickets = TicketSchema.array().parse(unparsedStoredTickets);

      const ticketId = params.ticketId;

      const ticketToUpdate = storedTickets.find((ticket) => ticket.id === ticketId);

      if (!ticketToUpdate) {
        throw new NotFoundError('Ticket is not found');
      }

      const data = CreateTicketAssignmentSchema.parse(await request.json());

      if (data.ticket_id !== ticketId) {
        throw new Error('Ticket ID is not match');
      }

      const unparsedStoredTicketAssignments =
        (await localforage.getItem('ticket_assignments')) ?? [];
      const storedTicketAssignments = TicketAssignmentSchema.array().parse(
        unparsedStoredTicketAssignments,
      );

      const newTicketAssignment: TicketAssignment = {
        id: nanoid(),
        ticket_id: data.ticket_id,
        admin_id: data.admin_id,
        created_at: new Date().toISOString(),
      };

      const newTicketAssignments = [...storedTicketAssignments, newTicketAssignment];

      await localforage.setItem('ticket_assignments', newTicketAssignments);

      return successResponse({
        data: newTicketAssignment,
        message: 'Successfully created ticket assignment',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.delete(
    '/api/tickets/:ticketId/assignments/:ticketAssignmentId',
    async ({ cookies, params }) => {
      try {
        await allowSuperAdminOnly({ sessionId: cookies.sessionId });

        const unparsedStoredTicketAssignments = await localforage.getItem('ticket_assignments');
        const storedTicketAssignments = TicketAssignmentSchema.array().parse(
          unparsedStoredTicketAssignments,
        );

        const ticketAssignmentId = params.ticketAssignmentId;

        const ticketAssignmentToDelete = storedTicketAssignments.find(
          (ticketAssignment) => ticketAssignment.id === ticketAssignmentId,
        );

        if (!ticketAssignmentToDelete) {
          throw new NotFoundError('Ticket assignment is not found');
        }

        const softDeletedTicketAssignment: TicketAssignment = {
          ...ticketAssignmentToDelete,
          deleted_at: new Date().toISOString(),
        };

        const newTicketAssignments = storedTicketAssignments.map((ticketAssignment) => {
          if (ticketAssignment.id !== ticketAssignmentId) {
            return ticketAssignment;
          }
          return softDeletedTicketAssignment;
        });

        await localforage.setItem('ticket_assignments', newTicketAssignments);

        return successResponse({
          data: softDeletedTicketAssignment,
          message: 'Successfully deleted ticket assignment',
        });
      } catch (error) {
        return handleResponseError(error);
      }
    },
  ),
];
