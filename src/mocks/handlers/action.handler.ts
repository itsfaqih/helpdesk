import { http } from 'msw';
import { matchSorter } from 'match-sorter';
import {
  allowAuthenticatedOnly,
  allowSuperAdminOnly,
  handleResponseError,
  successResponse,
} from '../mock-utils';
import { generatePaginationMeta } from '@/utils/api.util';
import {
  Action,
  ActionSchema,
  CreateActionSchema,
  UpdateActionSchema,
} from '@/schemas/action.schema';
import { ActionIndexRequestSchema } from '@/queries/action.query';
import { NotFoundError, UnprocessableEntityError } from '@/utils/error.util';
import { nanoid } from 'nanoid';
import { ActionFieldSchema } from '@/schemas/action-field.schema';
import { db } from '../records/db';

export const actionHandlers = [
  http.get('/api/actions', async ({ cookies, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const unparsedStoredActions = await db.actions.toArray();
      const storedActions = ActionSchema.array().parse(unparsedStoredActions);

      const unparsedFilters = Object.fromEntries(new URL(request.url).searchParams);
      const filters = ActionIndexRequestSchema.parse(unparsedFilters);

      const filteredActions = matchSorter(
        storedActions.filter((_) => {
          if (filters.channel_id) {
            // TODO: Implement this
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

      const unparsedStoredActions = await db.actions.where('id').equals(params.actionId).toArray();
      const storedActions = ActionSchema.array().parse(unparsedStoredActions);

      const actionId = params.actionId;

      const action = storedActions.find((action) => action.id === actionId);

      if (!action) {
        throw new NotFoundError('Action is not found');
      }

      const unparsedFields = await db.action_fields.toArray();
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

      const isActionExisted = (await db.actions.where({ label: data.label }).count()) > 0;

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

      await db.actions.add(newAction);

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

      const isActionExisted = (await db.actions.where({ label: data.label }).count()) > 0;

      if (isActionExisted) {
        throw new UnprocessableEntityError('Action with the same name is already registered');
      }

      const actionId = params.actionId;

      const updatedRecords = await db.actions.update(actionId, {
        ...data,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecords === 0) {
        throw new NotFoundError('Action is not found');
      }

      const updatedAction = await db.actions.get(actionId);

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

      const actionId = params.actionId;

      const updatedRecordsCount = await db.actions.update(actionId, {
        is_archived: true,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('Action is not found');
      }

      const updatedAction = await db.actions.get(actionId);

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

      const actionId = params.actionId;

      const updatedRecordsCount = await db.actions.update(actionId, {
        is_archived: false,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('Action is not found');
      }

      const updatedAction = await db.actions.get(actionId);

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

      const actionId = params.actionId;

      const updatedRecordsCount = await db.actions.update(actionId, {
        is_disabled: false,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('Action is not found');
      }

      const updatedAction = await db.actions.get(actionId);

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

      const actionId = params.actionId;

      const updatedRecordsCount = await db.actions.update(actionId, {
        is_disabled: true,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('Action is not found');
      }

      const updatedAction = await db.actions.get(actionId);

      return successResponse({
        data: updatedAction,
        message: 'Successfully deactivated action',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
