import { api } from "@/libs/api.lib";
import {
  TicketCategorySchema,
  TicketSchema,
  TicketStatusEnum,
} from "@/schemas/ticket.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import { UserError } from "@/utils/error.util";
import { QueryClient, useQuery } from "@tanstack/react-query";
import qs from "qs";
import { z } from "zod";

export const TicketIndexRequestSchema = z.object({
  search: z.string().optional().catch(undefined),
  is_archived: z.enum(["1", "0"]).optional().catch(undefined),
  status: z
    .enum(["", ...TicketStatusEnum.options])
    .optional()
    .catch(undefined),
  category_id: z.string().optional().catch(undefined),
  page: z.coerce.number().optional().catch(undefined),
});

export type TicketIndexRequest = z.infer<typeof TicketIndexRequestSchema>;

const TicketIndexResponseSchema = APIResponseSchema({
  schema: TicketSchema.array(),
});

export function ticketIndexQuery(request: TicketIndexRequest = {}) {
  return {
    queryKey: ["ticket", "index", request],
    async queryFn() {
      const queryStrings = qs.stringify(request);
      const res = await api.get(`/tickets?${queryStrings}`);

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
  schema: TicketSchema,
});

export function ticketShowQuery(request: TicketShowRequest) {
  const { id, ...requestWithoutId } = request;

  return {
    queryKey: ["ticket", "show", id, requestWithoutId],
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

export async function fetchTicketShowQuery({
  queryClient,
  request,
}: FetchTicketShowQueryParams) {
  const ticketShowQueryOpt = ticketShowQuery(request);

  queryClient.getQueryData(ticketShowQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(ticketShowQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}

export const TicketCategoryIndexRequestSchema = z.object({
  search: z.string().optional().catch(undefined),
  is_archived: z.enum(["1", "0"]).optional().catch(undefined),
  page: z.coerce.number().optional().catch(undefined),
});

export type TicketCategoryIndexRequest = z.infer<
  typeof TicketCategoryIndexRequestSchema
>;

export const TicketCategoryIndexResponseSchema = APIResponseSchema({
  schema: TicketCategorySchema.array(),
});

export function ticketCategoryIndexQuery(
  request: TicketCategoryIndexRequest = {}
) {
  return {
    queryKey: ["ticket-category", "index", request],
    async queryFn() {
      const queryStrings = qs.stringify(request);
      const res = await api.get(`/ticket-categories?${queryStrings}`);

      return TicketCategoryIndexResponseSchema.parse(res);
    },
  };
}

export function useTicketCategoryIndexQuery(
  request: TicketCategoryIndexRequest
) {
  return useQuery(ticketCategoryIndexQuery(request));
}

type FetchTicketCategoryIndexQueryParams = {
  queryClient: QueryClient;
  request: TicketCategoryIndexRequest;
};

export async function fetchTicketCategoryIndexQuery({
  queryClient,
  request,
}: FetchTicketCategoryIndexQueryParams) {
  const ticketCategoryIndexQueryOpt = ticketCategoryIndexQuery(request);

  queryClient.getQueryData(ticketCategoryIndexQueryOpt.queryKey) ??
    (await queryClient
      .fetchQuery(ticketCategoryIndexQueryOpt)
      .catch((error) => {
        if (error instanceof UserError) {
          throw error;
        }
      }));
}

export const TicketCategoryShowRequestSchema = z.object({
  id: z.string(),
});

export type TicketCategoryShowRequest = z.infer<
  typeof TicketCategoryShowRequestSchema
>;

export const TicketCategoryShowResponseSchema = APIResponseSchema({
  schema: TicketCategorySchema,
});

export function ticketCategoryShowQuery(request: TicketCategoryShowRequest) {
  const { id, ...requestWithoutId } = request;

  return {
    queryKey: ["ticket-category", "show", id, requestWithoutId],
    async queryFn() {
      const res = await api.get(`/ticket-categories/${id}`);

      return TicketCategoryShowResponseSchema.parse(res);
    },
  };
}

export function useTicketCategoryShowQuery(request: TicketCategoryShowRequest) {
  return useQuery(ticketCategoryShowQuery(request));
}

type FetchTicketCategoryShowQueryParams = {
  queryClient: QueryClient;
  request: TicketCategoryShowRequest;
};

export async function fetchTicketCategoryShowQuery({
  queryClient,
  request,
}: FetchTicketCategoryShowQueryParams) {
  const ticketCategoryShowQueryOpt = ticketCategoryShowQuery(request);

  queryClient.getQueryData(ticketCategoryShowQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(ticketCategoryShowQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}
