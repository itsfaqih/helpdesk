import { api } from "@/libs/api.lib";
import {
  AdminRoleEnum,
  AdminWithoutPasswordSchema,
} from "@/schemas/admin.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import { TicketSchema } from "@/schemas/ticket.schema";
import { UserError } from "@/utils/error.util";
import { QueryClient, useQuery } from "@tanstack/react-query";
import qs from "qs";
import { z } from "zod";

export const AdminIndexRequestSchema = z.object({
  search: z.string().optional().catch(undefined),
  role: z
    .enum(["", ...AdminRoleEnum.options])
    .optional()
    .catch(undefined),
  is_active: z.enum(["1", "0"]).optional().catch(undefined),
  assignable_ticket_id: TicketSchema.shape.id.optional().catch(undefined),
  page: z.coerce.number().optional().catch(undefined),
});

export type AdminIndexRequest = z.infer<typeof AdminIndexRequestSchema>;

const AdminIndexResponseSchema = APIResponseSchema({
  schema: AdminWithoutPasswordSchema.array(),
});

export function adminIndexQuery(request: AdminIndexRequest = {}) {
  return {
    queryKey: ["admin", "index", request],
    async queryFn() {
      const queryStrings = qs.stringify(request);
      const res = await api.get(`/admins?${queryStrings}`);

      return AdminIndexResponseSchema.parse(res);
    },
  };
}

export function useAdminIndexQuery(request: AdminIndexRequest = {}) {
  return useQuery(adminIndexQuery(request));
}

type FetchAdminIndexQueryParams = {
  queryClient: QueryClient;
  request?: AdminIndexRequest;
};

export async function fetchAdminIndexQuery({
  queryClient,
  request = {},
}: FetchAdminIndexQueryParams) {
  const adminIndexQueryOpt = adminIndexQuery(request);

  queryClient.getQueryData(adminIndexQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(adminIndexQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}

export const AdminShowRequestSchema = z.object({
  id: z.string(),
});

export type AdminShowRequest = z.infer<typeof AdminShowRequestSchema>;

const AdminShowResponseSchema = APIResponseSchema({
  schema: AdminWithoutPasswordSchema,
});

export function adminShowQuery(request: AdminShowRequest) {
  const { id, ...requestWithoutId } = request;

  return {
    queryKey: ["admin", "show", id, requestWithoutId],
    async queryFn() {
      const res = await api.get(`/admins/${id}`);

      return AdminShowResponseSchema.parse(res);
    },
  };
}

export function useAdminShowQuery(request: AdminShowRequest) {
  return useQuery(adminShowQuery(request));
}

type FetchAdminShowQueryParams = {
  queryClient: QueryClient;
  request: AdminShowRequest;
};

export async function fetchAdminShowQuery({
  queryClient,
  request,
}: FetchAdminShowQueryParams) {
  const adminShowQueryOpt = adminShowQuery(request);

  queryClient.getQueryData(adminShowQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(adminShowQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}
