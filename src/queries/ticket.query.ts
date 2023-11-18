import { api } from '@/libs/api.lib';
import {
  TicketTagSchema,
  TicketStatusEnum,
  TicketWithRelationsSchema,
} from '@/schemas/ticket.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { UserError } from '@/utils/error.util';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

export const TicketIndexRequestSchema = z.object({
  search: z.string().optional().catch(undefined),
  is_archived: z.enum(['1', '0']).optional().catch(undefined),
  status: z
    .enum(['all', ...TicketStatusEnum.options])
    .optional()
    .catch(undefined),
  tag_id: z.string().optional().catch(undefined),
  page: z.coerce.number().optional().catch(undefined),
});

export type TicketIndexRequest = z.infer<typeof TicketIndexRequestSchema>;

const TicketIndexResponseSchema = APIResponseSchema({
  schema: TicketWithRelationsSchema.array(),
});

export function ticketIndexQuery(request: TicketIndexRequest = {}) {
  return {
    queryKey: ['ticket', 'index', request],
    async queryFn() {
      const res = await api.query(request).get('/tickets');

      return TicketIndexResponseSchema.parse(res);
    },
  };
}

export function useTicketIndexQuery(request: TicketIndexRequest = {}) {
  return useQuery(ticketIndexQuery(request));
}

type FetchTicketIndexQueryParams = {
  queryClient: QueryClient;
  request?: TicketIndexRequest;
};

export async function fetchTicketIndexQuery({
  queryClient: queryClient,
  request = {},
}: FetchTicketIndexQueryParams) {
  const ticketIndexQueryOpt = ticketIndexQuery(request);

  queryClient.getQueryData(ticketIndexQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(ticketIndexQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}

export const TicketShowRequestSchema = z.object({
  id: z.string(),
});

export type TicketShowRequest = z.infer<typeof TicketShowRequestSchema>;

const TicketShowResponseSchema = APIResponseSchema({
  schema: TicketWithRelationsSchema,
});

export function ticketShowQuery(request: TicketShowRequest) {
  const { id, ...requestWithoutId } = request;

  return {
    queryKey: ['ticket', 'show', id, requestWithoutId],
    async queryFn() {
      const res = await api.get(`/tickets/${id}`);

      return TicketShowResponseSchema.parse(res);
    },
  };
}

export function useTicketShowQuery(request: TicketShowRequest) {
  return useQuery(ticketShowQuery(request));
}

type FetchTicketShowQueryParams = {
  queryClient: QueryClient;
  request: TicketShowRequest;
};

export async function fetchTicketShowQuery({ queryClient, request }: FetchTicketShowQueryParams) {
  const ticketShowQueryOpt = ticketShowQuery(request);

  queryClient.getQueryData(ticketShowQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(ticketShowQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}

export const TicketTagIndexRequestSchema = z.object({
  search: z.string().optional().catch(undefined),
  is_archived: z.enum(['1', '0']).optional().catch(undefined),
  page: z.coerce.number().optional().catch(undefined),
});

export type TicketTagIndexRequest = z.infer<typeof TicketTagIndexRequestSchema>;

export const TicketTagIndexResponseSchema = APIResponseSchema({
  schema: TicketTagSchema.array(),
});

export function ticketTagIndexQuery(request: TicketTagIndexRequest = {}) {
  return {
    queryKey: ['ticket-tag', 'index', request],
    async queryFn() {
      const res = await api.query(request).get('/ticket-tags');

      return TicketTagIndexResponseSchema.parse(res);
    },
  };
}

export function useTicketTagIndexQuery(request: TicketTagIndexRequest) {
  return useQuery(ticketTagIndexQuery(request));
}

type FetchTicketTagIndexQueryParams = {
  queryClient: QueryClient;
  request: TicketTagIndexRequest;
};

export async function fetchTicketTagIndexQuery({
  queryClient,
  request,
}: FetchTicketTagIndexQueryParams) {
  const ticketTagIndexQueryOpt = ticketTagIndexQuery(request);

  queryClient.getQueryData(ticketTagIndexQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(ticketTagIndexQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}

export const TicketTagShowRequestSchema = z.object({
  id: z.string(),
});

export type TicketTagShowRequest = z.infer<typeof TicketTagShowRequestSchema>;

export const TicketTagShowResponseSchema = APIResponseSchema({
  schema: TicketTagSchema,
});

export function ticketTagShowQuery(request: TicketTagShowRequest) {
  const { id, ...requestWithoutId } = request;

  return {
    queryKey: ['ticket-tag', 'show', id, requestWithoutId],
    async queryFn() {
      const res = await api.get(`/ticket-tags/${id}`);

      return TicketTagShowResponseSchema.parse(res);
    },
  };
}

export function useTicketTagShowQuery(request: TicketTagShowRequest) {
  return useQuery(ticketTagShowQuery(request));
}

type FetchTicketTagShowQueryParams = {
  queryClient: QueryClient;
  request: TicketTagShowRequest;
};

export async function fetchTicketTagShowQuery({
  queryClient,
  request,
}: FetchTicketTagShowQueryParams) {
  const ticketTagShowQueryOpt = ticketTagShowQuery(request);

  queryClient.getQueryData(ticketTagShowQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(ticketTagShowQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}
