import { Action } from '@/schemas/action.schema';
import { nanoid } from 'nanoid';

export const mockActionRecords: Action[] = [
  {
    id: nanoid(),
    label: 'Reply by Email',
    icon_type: 'emoji',
    icon_value: 'email',
    description: "Send the reply directly to the customer's email",
    form_method: 'POST',
    webhook_url: 'https://example.com/send-email',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    is_archived: false,
    is_disabled: false,
  },
];
