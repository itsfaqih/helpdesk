import { api } from '@/libs/api.lib';
import { UserRoleEnum, UserWithoutPasswordSchema } from '@/schemas/user.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { TicketSchema } from '@/schemas/ticket.schema';
import { UserError } from '@/utils/error.util';
import { QueryClient, useQuery } from '@tanstack/react-query';
import qs from 'qs';
import { z } from 'zod';

export const UserIndexRequestSchema = z.object({
  search: z.string().optional().catch(undefined),
  role: z
    .enum(['all', ...UserRoleEnum.options])
    .optional()
    .catch(undefined),
  is_active: z.enum(['all', '1', '0']).optional().catch(undefined),
  is_archived: z.enum(['1', '0']).optional().catch(undefined),
  assignable_ticket_id: TicketSchema.shape.id.optional().catch(undefined),
  page: z.coerce.number().optional().catch(undefined),
});

export type UserIndexRequest = z.infer<typeof UserIndexRequestSchema>;

const UserIndexResponseSchema = APIResponseSchema({
  schema: UserWithoutPasswordSchema.array(),
});

export function userIndexQuery(request: UserIndexRequest = {}) {
  return {
    queryKey: ['user', 'index', request],
    async queryFn() {
      const queryStrings = qs.stringify(request);
      const res = await api.get(`/users?${queryStrings}`);

      return UserIndexResponseSchema.parse(res);
    },
  };
}

export function useUserIndexQuery(request: UserIndexRequest = {}) {
  return useQuery(userIndexQuery(request));
}

type FetchUserIndexQueryParams = {
  queryClient: QueryClient;
  request?: UserIndexRequest;
};

export async function fetchUserIndexQuery({
  queryClient,
  request = {},
}: FetchUserIndexQueryParams) {
  const userIndexQueryOpt = userIndexQuery(request);

  queryClient.getQueryData(userIndexQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(userIndexQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}

export const UserShowRequestSchema = z.object({
  id: z.string(),
});

export type UserShowRequest = z.infer<typeof UserShowRequestSchema>;

const UserShowResponseSchema = APIResponseSchema({
  schema: UserWithoutPasswordSchema,
});

export function userShowQuery(request: UserShowRequest) {
  const { id, ...requestWithoutId } = request;

  return {
    queryKey: ['user', 'show', id, requestWithoutId],
    async queryFn() {
      const res = await api.get(`/users/${id}`);

      return UserShowResponseSchema.parse(res);
    },
  };
}

export function useUserShowQuery(request: UserShowRequest) {
  return useQuery(userShowQuery(request));
}

type FetchUserShowQueryParams = {
  queryClient: QueryClient;
  request: UserShowRequest;
};

export async function fetchUserShowQuery({ queryClient, request }: FetchUserShowQueryParams) {
  const userShowQueryOpt = userShowQuery(request);

  queryClient.getQueryData(userShowQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(userShowQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}
