import { http } from 'msw';
import { allowAuthenticatedOnly, handleResponseError, successResponse } from '../mock-utils';
import {
  ActionField,
  CreateActionFieldSchema,
  UpdateActionFieldSchema,
} from '@/schemas/action-field.schema';
import { nanoid } from 'nanoid';
import { NotFoundError } from '@/utils/error.util';
import { arrayMove } from '@dnd-kit/sortable';
import { db } from '../records/db';

export const actionFieldHandlers = [
  http.get('/api/actions/:actionId/fields', async ({ cookies, params }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const actionId = params.actionId as string;

      const storedActionFields = await db.action_fields
        .where({ action_id: actionId })
        .sortBy('order');

      return successResponse({
        data: storedActionFields,
        message: 'Successfully retrieved action fields',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.post('/api/actions/:actionId/fields', async ({ cookies, params, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const actionId = params.actionId as string;

      const storedActionFieldsLength = await db.action_fields
        .where('action_id')
        .equals(actionId)
        .count();

      const data = CreateActionFieldSchema.parse(await request.json());

      const newActionField: ActionField = {
        id: nanoid(),
        name: data.name,
        label: data.label,
        type: data.type,
        placeholder: data.placeholder,
        is_required: data.is_required,
        helper_text: data.helper_text,
        order: storedActionFieldsLength + 1,
        action_id: data.action_id,
      };

      await db.action_fields.add(newActionField);

      return successResponse({
        data: newActionField,
        message: 'Successfully created action field',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/actions/:actionId/fields/:actionFieldId', async ({ cookies, params, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const actionId = params.actionId as string;
      const actionFieldId = params.actionFieldId as string;

      const storedActionFields = await db.action_fields
        .where('action_id')
        .equals(actionId)
        .toArray();

      const data = UpdateActionFieldSchema.parse(await request.json());

      let updatedActionField: ActionField | null = null;

      let newActionFields = storedActionFields;

      if (data.order !== undefined) {
        const sortedActionFields = storedActionFields.sort((a, b) => a.order - b.order);

        const oldIndex = sortedActionFields.findIndex(
          (actionField) => actionField.id === actionFieldId,
        );
        const newIndex = sortedActionFields.findIndex(
          (actionField) => actionField.order === data.order,
        );

        newActionFields = arrayMove(storedActionFields, oldIndex, newIndex).map(
          (actionField, index) => {
            if (actionField.id === actionFieldId) {
              return (updatedActionField = {
                ...actionField,
                ...data,
                order: index + 1,
              });
            }

            return { ...actionField, order: index + 1 };
          },
        );
      } else {
        newActionFields = storedActionFields.map((actionField) => {
          if (actionField.id === actionFieldId) {
            return (updatedActionField = {
              ...actionField,
              ...data,
            });
          }

          return actionField;
        });
      }

      if (!updatedActionField) {
        throw new NotFoundError('Action field not found');
      }

      await db.action_fields.bulkPut(newActionFields);

      return successResponse({
        message: 'Successfully updated action field',
        data: updatedActionField,
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.delete('/api/actions/:actionId/fields/:actionFieldId', async ({ cookies, params }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const actionFieldId = params.actionFieldId as string;

      await db.action_fields.delete(actionFieldId);

      return successResponse({
        message: 'Successfully deleted action field',
        data: null,
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
