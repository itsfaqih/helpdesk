import { http } from 'msw';
import { matchSorter } from 'match-sorter';
import {
  allowAuthenticatedOnly,
  allowSuperAdminOnly,
  handleResponseError,
  successResponse,
} from '../mock-utils';
import { generatePaginationMeta } from '@/utils/api.util';
import localforage from 'localforage';
import {
  Action,
  ActionSchema,
  CreateActionSchema,
  UpdateActionSchema,
} from '@/schemas/action.schema';
import { ActionIndexRequestSchema } from '@/queries/action.query';
import { ActionChannelSchema } from '@/schemas/action-channel.schema';
import { NotFoundError, UnprocessableEntityError } from '@/utils/error.util';
import { nanoid } from 'nanoid';
import { ActionFieldSchema } from '@/schemas/action-field.schema';

export const actionHandlers = [
  http.get('/api/actions', async ({ cookies, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const unparsedStoredActions = (await localforage.getItem('actions')) ?? [];
      const storedActions = ActionSchema.array().parse(unparsedStoredActions);

      const unparsedFilters = Object.fromEntries(new URL(request.url).searchParams);
      const filters = ActionIndexRequestSchema.parse(unparsedFilters);

      const filteredActions = matchSorter(
        storedActions.filter((action) => {
          if (filters.channel_id) {
            const unparsedStoredActionChannels = localforage.getItem('action_channel');
            const storedActionChannels = ActionChannelSchema.array().parse(
              unparsedStoredActionChannels,
            );

            const actionChannels = storedActionChannels.filter(
              (actionChannel) => actionChannel.channel_id === filters.channel_id,
            );

            return actionChannels.some((actionChannel) => actionChannel.action_id === action.id);
          }

          return true;
        }),
        filters.search ?? '',
        {
          keys: ['label'],
        },
      );

      const page = filters.page ?? 1;

      const paginatedActions = filteredActions.slice((page - 1) * 10, page * 10);

      return successResponse({
        data: paginatedActions,
        message: 'Successfully retrieved actions',
        meta: {
          ...generatePaginationMeta({
            currentPage: page,
            total: filteredActions.length,
          }),
        },
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/actions/:actionId', async ({ cookies, params }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const unparsedStoredActions = (await localforage.getItem('actions')) ?? [];
      const storedActions = ActionSchema.array().parse(unparsedStoredActions);

      const actionId = params.actionId;

      const action = storedActions.find((action) => action.id === actionId);

      if (!action) {
        throw new NotFoundError('Action is not found');
      }

      const unparsedFields = (await localforage.getItem('action_fields')) ?? [];
      const storedFields = ActionFieldSchema.array().parse(unparsedFields);

      const fields = storedFields
        .filter((field) => field.action_id === actionId)
        .sort((fieldA, fieldB) => fieldA.order - fieldB.order);

      return successResponse({
        data: { ...action, fields },
        message: 'Successfully retrieved action',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.post('/api/actions', async ({ cookies, request }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const data = CreateActionSchema.parse(await request.json());

      const unparsedStoredActions = (await localforage.getItem('actions')) ?? [];
      const storedActions = ActionSchema.array().parse(unparsedStoredActions);

      const isActionExisted = storedActions.some((action) => action.label === data.label);

      if (isActionExisted) {
        throw new UnprocessableEntityError('Action with the same name is already registered');
      }

      const newAction: Action = {
        id: nanoid(),
        icon_type: data.icon_type,
        icon_value: data.icon_value,
        label: data.label,
        description: data.description,
        form_method: null,
        webhook_url: '',
        is_archived: false,
        is_disabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newActions = [...storedActions, newAction];

      await localforage.setItem('actions', newActions);

      return successResponse({
        data: newAction,
        message: 'Successfully created action',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/actions/:actionId', async ({ cookies, request, params }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const data = UpdateActionSchema.parse(await request.json());

      const unparsedStoredActions = (await localforage.getItem('actions')) ?? [];
      const storedActions = ActionSchema.array().parse(unparsedStoredActions);

      const actionId = params.actionId;

      const actionToUpdate = storedActions.find((action) => action.id === actionId);

      if (!actionToUpdate) {
        throw new NotFoundError('Action is not found');
      }

      const updatedAction: Action = {
        ...actionToUpdate,
        ...data,
        updated_at: new Date().toISOString(),
      };

      const newActions = storedActions.map((action) =>
        action.id === actionId ? updatedAction : action,
      );

      await localforage.setItem('actions', newActions);

      return successResponse({
        data: updatedAction,
        message: 'Successfully updated action',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/actions/:actionId/archive', async ({ cookies, params }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const unparsedStoredAction = (await localforage.getItem('actions')) ?? [];
      const storedActions = ActionSchema.array().parse(unparsedStoredAction);

      const actionId = params.actionId;

      const actionToUpdate = storedActions.find((action) => action.id === actionId);

      if (!actionToUpdate) {
        throw new NotFoundError('Action is not found');
      }

      const updatedAction: Action = {
        ...actionToUpdate,
        is_archived: true,
        updated_at: new Date().toISOString(),
      };

      const newActions = storedActions.map((action) =>
        action.id === actionId ? updatedAction : action,
      );

      await localforage.setItem('actions', newActions);

      return successResponse({
        data: updatedAction,
        message: 'Successfully archived action',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/actions/:actionId/restore', async ({ cookies, params }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const unparsedStoredActions = (await localforage.getItem('actions')) ?? [];
      const storedActions = ActionSchema.array().parse(unparsedStoredActions);

      const actionId = params.actionId;

      const actionToUpdate = storedActions.find((action) => action.id === actionId);

      if (!actionToUpdate) {
        throw new NotFoundError('Action is not found');
      }

      const updatedAction: Action = {
        ...actionToUpdate,
        is_archived: false,
        updated_at: new Date().toISOString(),
      };

      const newActions = storedActions.map((action) =>
        action.id === actionId ? updatedAction : action,
      );

      await localforage.setItem('actions', newActions);

      return successResponse({
        data: updatedAction,
        message: 'Successfully activated action',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/actions/:actionId/enable', async ({ cookies, params }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const unparsedStoredActions = (await localforage.getItem('actions')) ?? [];
      const storedActions = ActionSchema.array().parse(unparsedStoredActions);

      const actionId = params.actionId;

      const actionToUpdate = storedActions.find((action) => action.id === actionId);

      if (!actionToUpdate) {
        throw new NotFoundError('Action is not found');
      }

      const updatedAction: Action = {
        ...actionToUpdate,
        is_disabled: false,
        updated_at: new Date().toISOString(),
      };

      const newActions = storedActions.map((action) =>
        action.id === actionId ? updatedAction : action,
      );

      await localforage.setItem('actions', newActions);

      return successResponse({
        data: updatedAction,
        message: 'Successfully activated action',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/actions/:actionId/disable', async ({ cookies, params }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const unparsedStoredActions = (await localforage.getItem('actions')) ?? [];
      const storedActions = ActionSchema.array().parse(unparsedStoredActions);

      const actionId = params.actionId;

      const actionToUpdate = storedActions.find((action) => action.id === actionId);

      if (!actionToUpdate) {
        throw new NotFoundError('Action is not found');
      }

      const updatedAction: Action = {
        ...actionToUpdate,
        is_disabled: true,
        updated_at: new Date().toISOString(),
      };

      const newActions = storedActions.map((action) =>
        action.id === actionId ? updatedAction : action,
      );

      await localforage.setItem('actions', newActions);

      return successResponse({
        data: updatedAction,
        message: 'Successfully deactivated action',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
