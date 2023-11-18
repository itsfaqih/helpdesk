import { z } from 'zod';

export const AuditLogHeaderSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  table_name: z.string(),
  record_id: z.string(),
  actor_user_id: z.string(),
  action_type: z.enum(['create', 'update', 'delete']),
});

export const AuditLogValueSchema = z.object({
  audit_log_header_id: z.string(),
  field_name: z.string(),
  previous_value: z.string().nullable(),
  new_value: z.string().nullable(),
});
