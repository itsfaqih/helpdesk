import { api } from "@/libs/api.lib";
import { ClientSchema } from "@/schemas/client.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import { UserError } from "@/utils/error.util";
import { QueryClient, useQuery } from "@tanstack/react-query";
import qs from "qs";
import { z } from "zod";

export const ClientIndexRequestSchema = z.object({
  search: z.string().optional().catch(undefined),
  is_archived: z.enum(["1", "0"]).optional().catch(undefined),
  page: z.coerce.number().optional().catch(undefined),
});

export type ClientIndexRequest = z.infer<typeof ClientIndexRequestSchema>;

const ClientIndexResponseSchema = APIResponseSchema({
  schema: ClientSchema.array(),
});

export function clientIndexQuery(request: ClientIndexRequest = {}) {
  return {
    queryKey: ["client", "index", request],
    async queryFn() {
      const queryStrings = qs.stringify(request);
      const res = await api.get(`/clients?${queryStrings}`);

      return ClientIndexResponseSchema.parse(res);
    },
  };
}

export function useClientIndexQuery(request: ClientIndexRequest = {}) {
  return useQuery(clientIndexQuery(request));
}

type FetchClientIndexQueryParams = {
  queryClient: QueryClient;
  request?: ClientIndexRequest;
};

export async function fetchClientIndexQuery({
  queryClient,
  request = {},
}: FetchClientIndexQueryParams) {
  const clientIndexQueryOpt = clientIndexQuery(request);

  queryClient.getQueryData(clientIndexQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(clientIndexQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}

export const ClientShowRequestSchema = z.object({
  id: z.string(),
});

export type ClientShowRequest = z.infer<typeof ClientShowRequestSchema>;

const ClientShowResponseSchema = APIResponseSchema({
  schema: ClientSchema,
});

export function clientShowQuery(request: ClientShowRequest) {
  const { id, ...requestWithoutId } = request;

  return {
    queryKey: ["client", "show", id, requestWithoutId],
    async queryFn() {
      const res = await api.get(`/clients/${id}`);

      return ClientShowResponseSchema.parse(res);
    },
  };
}

export function useClientShowQuery(request: ClientShowRequest) {
  return useQuery(clientShowQuery(request));
}

type FetchClientShowQueryParams = {
  queryClient: QueryClient;
  request: ClientShowRequest;
};

export async function fetchClientShowQuery({
  queryClient,
  request,
}: FetchClientShowQueryParams) {
  const clientShowQueryOpt = clientShowQuery(request);

  queryClient.getQueryData(clientShowQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(clientShowQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}
