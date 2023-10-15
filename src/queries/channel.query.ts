import { api } from '@/libs/api.lib';
import { ChannelSchema } from '@/schemas/channel.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { UserError } from '@/utils/error.util';
import { QueryClient, useQuery } from '@tanstack/react-query';
import qs from 'qs';
import { z } from 'zod';

export const ChannelIndexRequestSchema = z.object({
  search: z.string().optional().catch(undefined),
  is_archived: z.enum(['1', '0']).optional().catch(undefined),
  page: z.coerce.number().optional().catch(undefined),
});

export type ChannelIndexRequest = z.infer<typeof ChannelIndexRequestSchema>;

const ChannelIndexResponseSchema = APIResponseSchema({
  schema: ChannelSchema.array(),
});

export function channelIndexQuery(request: ChannelIndexRequest = {}) {
  return {
    queryKey: ['channel', 'index', request],
    async queryFn() {
      const queryStrings = qs.stringify(request);
      const res = await api.get(`/channels?${queryStrings}`);

      return ChannelIndexResponseSchema.parse(res);
    },
  };
}

export function useChannelIndexQuery(request: ChannelIndexRequest = {}) {
  return useQuery(channelIndexQuery(request));
}

type FetchChannelIndexQueryParams = {
  queryClient: QueryClient;
  request?: ChannelIndexRequest;
};

export async function fetchChannelIndexQuery({
  queryClient,
  request = {},
}: FetchChannelIndexQueryParams) {
  const channelIndexQueryOpt = channelIndexQuery(request);

  queryClient.getQueryData(channelIndexQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(channelIndexQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}

export const ChannelShowRequestSchema = z.object({
  id: z.string(),
});

export type ChannelShowRequest = z.infer<typeof ChannelShowRequestSchema>;

const ChannelShowResponseSchema = APIResponseSchema({
  schema: ChannelSchema,
});

export function channelShowQuery(request: ChannelShowRequest) {
  const { id, ...requestWithoutId } = request;

  return {
    queryKey: ['channel', 'show', id, requestWithoutId],
    async queryFn() {
      const res = await api.get(`/channels/${id}`);

      return ChannelShowResponseSchema.parse(res);
    },
  };
}

export function useChannelShowQuery(request: ChannelShowRequest) {
  return useQuery(channelShowQuery(request));
}

type FetchChannelShowQueryParams = {
  queryClient: QueryClient;
  request: ChannelShowRequest;
};

export async function fetchChannelShowQuery({ queryClient, request }: FetchChannelShowQueryParams) {
  const channelShowQueryOpt = channelShowQuery(request);

  queryClient.getQueryData(channelShowQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(channelShowQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}
