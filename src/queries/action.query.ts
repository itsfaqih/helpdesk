import { api } from '@/libs/api.lib';
import { APIResponseSchema } from '@/schemas/api.schema';
import { ActionSchema } from '@/schemas/action.schema';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import qs from 'qs';
import { ChannelSchema } from '@/schemas/channel.schema';
import { UserError } from '@/utils/error.util';
import { ActionFieldSchema } from '@/schemas/action-field.schema';

export const ActionIndexRequestSchema = z.object({
  search: z.string().optional().catch(undefined),
  is_archived: z.enum(['1', '0']).optional().catch(undefined),
  page: z.coerce.number().optional().catch(undefined),
  channel_id: ChannelSchema.shape.id.optional().catch(undefined),
});

export type ActionIndexRequest = z.infer<typeof ActionIndexRequestSchema>;

const ActionIndexResponseSchema = APIResponseSchema({
  schema: ActionSchema.array(),
});

export function actionIndexQuery(request: ActionIndexRequest = {}) {
  return {
    queryKey: ['action', 'index', request],
    async queryFn() {
      const queryStrings = qs.stringify(request);
      const res = await api.get(`/actions?${queryStrings}`);

      return ActionIndexResponseSchema.parse(res);
    },
  };
}

export function useActionIndexQuery(request: ActionIndexRequest = {}) {
  return useQuery(actionIndexQuery(request));
}

type FetchActionIndexQueryParams = {
  queryClient: QueryClient;
  request?: ActionIndexRequest;
};

export async function fetchActionIndexQuery({
  queryClient,
  request = {},
}: FetchActionIndexQueryParams) {
  const actionIndexQueryOpt = actionIndexQuery(request);

  queryClient.getQueryData(actionIndexQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(actionIndexQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}

export const ActionShowRequestSchema = z.object({
  id: z.string(),
});

export type ActionShowRequest = z.infer<typeof ActionShowRequestSchema>;

const ActionShowResponseSchema = APIResponseSchema({
  schema: ActionSchema.extend({
    fields: ActionFieldSchema.array(),
  }),
});

export function actionShowQuery(request: ActionShowRequest) {
  const { id, ...requestWithoutId } = request;

  return {
    queryKey: ['action', 'show', id, requestWithoutId],
    async queryFn() {
      const res = await api.get(`/actions/${id}`);

      return ActionShowResponseSchema.parse(res);
    },
  };
}

export function useActionShowQuery(request: ActionShowRequest) {
  return useQuery(actionShowQuery(request));
}

type FetchActionShowQueryParams = {
  queryClient: QueryClient;
  request: ActionShowRequest;
};

export async function fetchActionShowQuery({ queryClient, request }: FetchActionShowQueryParams) {
  const actionShowQueryOpt = actionShowQuery(request);

  queryClient.getQueryData(actionShowQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(actionShowQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}
