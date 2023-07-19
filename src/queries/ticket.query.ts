import { api } from "@/libs/api.lib";
import { TicketSchema } from "@/schemas/ticket.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import { UserError } from "@/utils/error.util";
import { QueryClient, useQuery } from "@tanstack/react-query";
import qs from "qs";
import { z } from "zod";

export const TicketIndexRequestSchema = z.object({
  search: z.string().optional().catch(undefined),
  is_archived: z.enum(["1", "0"]).optional().catch(undefined),
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
  queryClient: queryTicket,
  request = {},
}: FetchTicketIndexQueryParams) {
  const ticketIndexQueryOpt = ticketIndexQuery(request);

  queryTicket.getQueryData(ticketIndexQueryOpt.queryKey) ??
    (await queryTicket.fetchQuery(ticketIndexQueryOpt).catch((error) => {
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
  queryTicket: QueryClient;
  request: TicketShowRequest;
};

export async function fetchTicketShowQuery({
  queryTicket,
  request,
}: FetchTicketShowQueryParams) {
  const ticketShowQueryOpt = ticketShowQuery(request);

  queryTicket.getQueryData(ticketShowQueryOpt.queryKey) ??
    (await queryTicket.fetchQuery(ticketShowQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}
