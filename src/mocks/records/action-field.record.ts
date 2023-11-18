import { nanoid } from 'nanoid';
import { mockActionRecords } from './action.record';
import { ActionField } from '@/schemas/action-field.schema';

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
