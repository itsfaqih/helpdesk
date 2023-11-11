import { Action, ActionSchema } from '@/schemas/action.schema';
import { nanoid } from 'nanoid';
import localforage from 'localforage';
import { NotFoundError } from '@/utils/error.util';
import { mockActionRecords } from './action.record';
import { ActionField, ActionFieldSchema } from '@/schemas/action-field.schema';

export function mockActionFieldRecords(): ActionField[] {
  return [
    // Email
    {
      id: nanoid(),
      action_id: mockActionRecords[0].id,
      name: 'subject',
      label: 'Subject',
      type: 'text',
      placeholder: 'Enter subject',
      helper_text: '',
      is_required: true,
      order: 1,
    },
    {
      id: nanoid(),
      action_id: mockActionRecords[0].id,
      name: 'content',
      label: 'Content',
      type: 'textarea',
      placeholder: 'Enter content',
      helper_text: '',
      is_required: true,
      order: 2,
    },
    {
      id: nanoid(),
      action_id: mockActionRecords[0].id,
      name: 'attachment',
      label: 'Attachment',
      type: 'file',
      placeholder: '',
      helper_text: '',
      is_required: false,
      order: 3,
    },
  ];
}

export async function getActionFieldsByActionId(actionId: Action['id']) {
  const unparsedStoredActions = await localforage.getItem('actions');

  const storedActions = ActionSchema.array().parse(unparsedStoredActions);

  const action = storedActions.find((action) => action.id === actionId);

  if (!action) {
    throw new NotFoundError(`Action with id ${actionId} not found`);
  }

  const unparsedStoredActionFields = await localforage.getItem('action_fields');
  const storedActionFields = ActionFieldSchema.array().parse(unparsedStoredActionFields);

  const filteredActionFields = storedActionFields.filter(
    (actionField) => actionField.action_id === actionId,
  );

  const sortedActionFields = filteredActionFields.sort((a, b) => a.order - b.order);

  return sortedActionFields;
}
