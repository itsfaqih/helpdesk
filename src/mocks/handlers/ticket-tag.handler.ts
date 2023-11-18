import { TicketTagIndexRequestSchema } from '@/queries/ticket.query';
import { CreateTicketTagSchema, TicketTag, UpdateTicketTagSchema } from '@/schemas/ticket.schema';
import { http } from 'msw';
import { nanoid } from 'nanoid';
import { allowAuthenticatedOnly, handleResponseError, successResponse } from '../mock-utils';
import { NotFoundError } from '@/utils/error.util';
import { generatePaginationMeta } from '@/utils/api.util';
import { db } from '../records/db';

export const ticketTagHandlers = [
  http.post('/api/ticket-tags', async ({ cookies, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const data = CreateTicketTagSchema.parse(await request.json());

      const newTicketTag: TicketTag = {
        id: nanoid(),
        name: data.name,
        description: data.description,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.ticket_tags.add(newTicketTag);

      return successResponse({
        data: newTicketTag,
        message: 'Successfully created ticket tag',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/ticket-tags', async ({ request }) => {
    try {
      const storedTicketTags = await db.ticket_tags.toArray();

      const unparsedFilters = Object.fromEntries(new URL(request.url).searchParams);
      const filters = TicketTagIndexRequestSchema.parse(unparsedFilters);

      const filteredTicketTags = storedTicketTags.filter((ticketTag) => {
        if (filters.search) {
          const search = filters.search.toLowerCase();

          const isMatched = ticketTag.name.toLowerCase().includes(search);

          if (!isMatched) {
            return false;
          }
        }

        if (filters.is_archived) {
          if (filters.is_archived === '1' && !ticketTag.is_archived) {
            return false;
          } else if (filters.is_archived === '0' && ticketTag.is_archived) {
            return false;
          }
        } else {
          return ticketTag.is_archived === false;
        }

        return true;
      });

      const sortedTicketTags = filteredTicketTags.sort((a, b) => {
        if (a.updated_at > b.updated_at) {
          return -1;
        } else if (a.updated_at < b.updated_at) {
          return 1;
        } else {
          return 0;
        }
      });

      const page = filters.page ?? 1;

      const paginatedTicketTags = sortedTicketTags.slice((page - 1) * 10, page * 10);

      return successResponse({
        data: paginatedTicketTags,
        message: 'Successfully retrieved ticket tags',
        meta: {
          ...generatePaginationMeta({
            currentPage: page,
            total: filteredTicketTags.length,
          }),
        },
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/ticket-tags/:ticketTagId', async ({ cookies, params }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const ticketTagId = params.ticketTagId;
      const ticketTag = await db.ticket_tags.get(ticketTagId);

      if (!ticketTag) {
        throw new NotFoundError('Ticket tag is not found');
      }

      return successResponse({
        data: ticketTag,
        message: 'Successfully retrieved ticket tag',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/ticket-tags/:ticketTagId', async ({ cookies, params, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const data = UpdateTicketTagSchema.parse(await request.json());

      const ticketTagId = params.ticketTagId;

      const isUpdated = await db.ticket_tags.update(ticketTagId, {
        ...data,
        updated_at: new Date().toISOString(),
      });

      if (!isUpdated) {
        throw new NotFoundError('Ticket tag is not found');
      }

      const updatedTicketTag = await db.ticket_tags.get(ticketTagId);

      return successResponse({
        data: updatedTicketTag,
        message: 'Successfully updated ticket tag',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/ticket-tags/:ticketTagId/archive', async ({ cookies, params }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const ticketTagId = params.ticketTagId;

      const isUpdated = await db.ticket_tags.update(ticketTagId, {
        is_archived: true,
        updated_at: new Date().toISOString(),
      });

      if (!isUpdated) {
        throw new NotFoundError('Ticket tag is not found');
      }

      const updatedTicketTag = await db.ticket_tags.get(ticketTagId);

      return successResponse({
        data: updatedTicketTag,
        message: 'Successfully archived ticket tag',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/ticket-tags/:ticketTagId/restore', async ({ params }) => {
    try {
      const ticketTagId = params.ticketTagId;

      const isUpdated = await db.ticket_tags.update(ticketTagId, {
        is_archived: false,
        updated_at: new Date().toISOString(),
      });

      if (!isUpdated) {
        throw new NotFoundError('Ticket tag is not found');
      }

      const updatedTicketTag = await db.ticket_tags.get(ticketTagId);

      return successResponse({
        data: updatedTicketTag,
        message: 'Successfully restored ticket tag',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
