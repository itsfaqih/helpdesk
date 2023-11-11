import { TicketCategoryIndexRequestSchema } from '@/queries/ticket.query';
import {
  CreateTicketCategorySchema,
  TicketCategorySchema,
  TicketCategory,
  UpdateTicketCategorySchema,
} from '@/schemas/ticket.schema';
import localforage from 'localforage';
import { http } from 'msw';
import { nanoid } from 'nanoid';
import { allowAuthenticatedOnly, handleResponseError, successResponse } from '../mock-utils';
import { NotFoundError } from '@/utils/error.util';
import { generatePaginationMeta } from '@/utils/api.util';
import { getTicketCategories } from '../records/ticket-category.record';

export const ticketCategoryHandlers = [
  http.post('/api/ticket-categories', async ({ cookies, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const data = CreateTicketCategorySchema.parse(await request.json());

      const unparsedStoredTicketCategories = (await localforage.getItem('ticket_categories')) ?? [];
      const storedTicketCategories = TicketCategorySchema.array().parse(
        unparsedStoredTicketCategories,
      );

      const newTicketCategory: TicketCategory = {
        id: nanoid(),
        name: data.name,
        description: data.description,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newTicketCategories = [...storedTicketCategories, newTicketCategory];

      await localforage.setItem('ticket_categories', newTicketCategories);

      return successResponse({
        data: newTicketCategory,
        message: 'Successfully created ticket category',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/ticket-categories', async ({ request }) => {
    try {
      const storedTicketCategories = await getTicketCategories();

      const unparsedFilters = Object.fromEntries(new URL(request.url).searchParams);
      const filters = TicketCategoryIndexRequestSchema.parse(unparsedFilters);

      const filteredTicketCategories = storedTicketCategories.filter((ticketCategory) => {
        if (filters.search) {
          const search = filters.search.toLowerCase();

          const isMatched = ticketCategory.name.toLowerCase().includes(search);

          if (!isMatched) {
            return false;
          }
        }

        if (filters.is_archived) {
          if (filters.is_archived === '1' && !ticketCategory.is_archived) {
            return false;
          } else if (filters.is_archived === '0' && ticketCategory.is_archived) {
            return false;
          }
        } else {
          return ticketCategory.is_archived === false;
        }

        return true;
      });

      const sortedTicketCategories = filteredTicketCategories.sort((a, b) => {
        if (a.updated_at > b.updated_at) {
          return -1;
        } else if (a.updated_at < b.updated_at) {
          return 1;
        } else {
          return 0;
        }
      });

      const page = filters.page ?? 1;

      const paginatedTicketCategories = sortedTicketCategories.slice((page - 1) * 10, page * 10);

      return successResponse({
        data: paginatedTicketCategories,
        message: 'Successfully retrieved ticket categories',
        meta: {
          ...generatePaginationMeta({
            currentPage: page,
            total: filteredTicketCategories.length,
          }),
        },
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/ticket-categories/:ticketCategoryId', async ({ cookies, params }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const unparsedStoredTicketCategories = (await localforage.getItem('ticket_categories')) ?? [];
      const storedTicketCategories = TicketCategorySchema.array().parse(
        unparsedStoredTicketCategories,
      );

      const ticketCategoryId = params.ticketCategoryId;

      const ticketCategory = storedTicketCategories.find(
        (ticketCategory) => ticketCategory.id === ticketCategoryId,
      );

      if (!ticketCategory) {
        throw new NotFoundError('Ticket category is not found');
      }

      return successResponse({
        data: ticketCategory,
        message: 'Successfully retrieved ticket category',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/ticket-categories/:ticketCategoryId', async ({ cookies, params, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const data = UpdateTicketCategorySchema.parse(await request.json());

      const unparsedStoredTicketCategories = (await localforage.getItem('ticket_categories')) ?? [];
      const storedTicketCategories = TicketCategorySchema.array().parse(
        unparsedStoredTicketCategories,
      );

      const ticketCategoryId = params.ticketCategoryId;

      const ticketCategoryToUpdate = storedTicketCategories.find(
        (ticketCategory) => ticketCategory.id === ticketCategoryId,
      );

      if (!ticketCategoryToUpdate) {
        throw new NotFoundError('Ticket category is not found');
      }

      const updatedTicketCategory: TicketCategory = {
        ...ticketCategoryToUpdate,
        ...data,
        updated_at: new Date().toISOString(),
      };

      const newTicketCategories = storedTicketCategories.map((ticketCategory) =>
        ticketCategory.id === ticketCategoryId ? updatedTicketCategory : ticketCategory,
      );

      await localforage.setItem('ticket_categories', newTicketCategories);

      return successResponse({
        data: updatedTicketCategory,
        message: 'Successfully updated ticket category',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/ticket-categories/:ticketCategoryId/archive', async ({ cookies, params }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const unparsedStoredTicketCategories = (await localforage.getItem('ticket_categories')) ?? [];
      const storedTicketCategories = TicketCategorySchema.array().parse(
        unparsedStoredTicketCategories,
      );

      const ticketCategoryId = params.ticketCategoryId;

      const ticketCategoryToUpdate = storedTicketCategories.find(
        (ticketCategory) => ticketCategory.id === ticketCategoryId,
      );

      if (!ticketCategoryToUpdate) {
        throw new NotFoundError('Ticket category is not found');
      }

      const updatedTicketCategory: TicketCategory = {
        ...ticketCategoryToUpdate,
        is_archived: true,
        updated_at: new Date().toISOString(),
      };

      const newTicketCategories = storedTicketCategories.map((ticketCategory) =>
        ticketCategory.id === ticketCategoryId ? updatedTicketCategory : ticketCategory,
      );

      await localforage.setItem('ticket_categories', newTicketCategories);

      return successResponse({
        data: updatedTicketCategory,
        message: 'Successfully archived ticket category',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/ticket-categories/:ticketCategoryId/restore', async ({ params }) => {
    try {
      const unparsedStoredTicketCategories = (await localforage.getItem('ticket_categories')) ?? [];
      const storedTicketCategories = TicketCategorySchema.array().parse(
        unparsedStoredTicketCategories,
      );

      const ticketCategoryId = params.ticketCategoryId;

      const ticketCategoryToUpdate = storedTicketCategories.find(
        (ticketCategory) => ticketCategory.id === ticketCategoryId,
      );

      if (!ticketCategoryToUpdate) {
        throw new NotFoundError('Ticket category is not found');
      }

      const updatedTicketCategory: TicketCategory = {
        ...ticketCategoryToUpdate,
        is_archived: false,
        updated_at: new Date().toISOString(),
      };

      const newTicketCategories = storedTicketCategories.map((ticketCategory) =>
        ticketCategory.id === ticketCategoryId ? updatedTicketCategory : ticketCategory,
      );

      await localforage.setItem('ticket_categories', newTicketCategories);

      return successResponse({
        data: updatedTicketCategory,
        message: 'Successfully restored ticket category',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
