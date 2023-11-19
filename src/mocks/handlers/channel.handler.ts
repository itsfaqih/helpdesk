import { ChannelIndexRequestSchema } from '@/queries/channel.query';
import { CreateChannelSchema, Channel, UpdateChannelSchema } from '@/schemas/channel.schema';
import { generatePaginationMeta } from '@/utils/api.util';
import { http } from 'msw';
import { nanoid } from 'nanoid';
import {
  allowAuthenticatedOnly,
  allowSuperAdminOnly,
  handleResponseError,
  successResponse,
} from '../mock-utils';
import { NotFoundError, UnprocessableEntityError } from '@/utils/error.util';
import { db } from '../records/db';

export const channelHandlers = [
  http.post('/api/channels', async ({ cookies, request }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const data = CreateChannelSchema.parse(await request.json());

      const isChannelExisted = (await db.channels.where({ name: data.name }).count()) > 0;

      if (isChannelExisted) {
        throw new UnprocessableEntityError('Channel with the same name is already registered');
      }

      const newChannel: Channel = {
        id: nanoid(),
        name: data.name,
        description: data.description,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.channels.add(newChannel);

      return successResponse({
        data: newChannel,
        message: 'Successfully created channel',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/channels', async ({ cookies, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const storedChannels = await db.channels.toArray();

      const unparsedFilters = Object.fromEntries(new URL(request.url).searchParams);
      const filters = ChannelIndexRequestSchema.parse(unparsedFilters);

      const filteredChannels = storedChannels.filter((channel) => {
        if (filters.search) {
          const search = filters.search.toLowerCase();

          const isMatched = channel.name.toLowerCase().includes(search);

          if (!isMatched) {
            return false;
          }
        }

        if (filters.is_archived) {
          if (filters.is_archived === '1' && !channel.is_archived) {
            return false;
          } else if (filters.is_archived === '0' && channel.is_archived) {
            return false;
          }
        } else {
          return channel.is_archived === false;
        }

        return true;
      });

      const sortedChannels = filteredChannels.sort((a, b) => {
        if (a.updated_at > b.updated_at) {
          return -1;
        } else if (a.updated_at < b.updated_at) {
          return 1;
        } else {
          return 0;
        }
      });

      const page = filters.page ?? 1;

      const paginatedChannels = sortedChannels.slice((page - 1) * 10, page * 10);

      return successResponse({
        data: paginatedChannels,
        message: 'Successfully retrieved channels',
        meta: {
          ...generatePaginationMeta({
            currentPage: page,
            total: filteredChannels.length,
          }),
        },
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/channels/:channelId', async ({ cookies, params }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const channelId = params.channelId;

      const channel = await db.channels.get(channelId);

      if (!channel) {
        throw new NotFoundError('Channel is not found');
      }

      return successResponse({
        data: channel,
        message: 'Successfully retrieved channel',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/channels/:channelId', async ({ cookies, params, request }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const channelId = params.channelId;

      const data = UpdateChannelSchema.parse(await request.json());

      const updatedRecordsCount = await db.channels.update(channelId, {
        description: data.description,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('Channel is not found');
      }

      const updatedChannel = await db.channels.get(channelId);

      return successResponse({
        data: updatedChannel,
        message: 'Successfully updated channel',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/channels/:channelId/archive', async ({ cookies, params }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const channelId = params.channelId;

      const updatedRecordsCount = await db.channels.update(channelId, {
        is_archived: true,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('Channel is not found');
      }

      const updatedChannel = await db.channels.get(channelId);

      return successResponse({
        data: updatedChannel,
        message: 'Successfully archived channel',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/channels/:channelId/restore', async ({ cookies, params }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const channelId = params.channelId;

      const updatedRecordsCount = await db.channels.update(channelId, {
        is_archived: false,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('Channel is not found');
      }

      const updatedChannel = await db.channels.get(channelId);

      return successResponse({
        data: updatedChannel,
        message: 'Successfully activated channel',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
