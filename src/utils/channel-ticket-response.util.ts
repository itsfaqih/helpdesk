import { z } from 'zod';
import { ActionField } from '@/schemas/action.schema';

export function channelTicketResponseFieldsToZodSchema(channelTicketResponseFields: ActionField[]) {
  const fieldsSchema: Record<ActionField['name'], z.ZodType> = {};

  for (const channelTicketResponseField of channelTicketResponseFields) {
    if (channelTicketResponseField.type === 'file') {
      let schema: z.ZodType = z.instanceof(FileList);

      if (!channelTicketResponseField.is_required) {
        schema = z.instanceof(FileList).nullable();
      }

      fieldsSchema[channelTicketResponseField.name] = schema;
      continue;
    }

    if (channelTicketResponseField.type === 'text') {
      let schema: z.ZodType = z.string();

      if (channelTicketResponseField.is_required) {
        schema = z.string().nonempty(`${channelTicketResponseField.label} must not be empty`);
      } else {
        schema = z.string().nullable();
      }

      fieldsSchema[channelTicketResponseField.name] = schema;
      continue;
    }

    if (channelTicketResponseField.type === 'textarea') {
      let schema: z.ZodType = z.string();

      if (channelTicketResponseField.is_required) {
        schema = z.string().nonempty(`${channelTicketResponseField.label} must not be empty`);
      } else {
        schema = z.string().nullable();
      }

      fieldsSchema[channelTicketResponseField.name] = schema;
      continue;
    }
  }

  return z.object(fieldsSchema);
}
