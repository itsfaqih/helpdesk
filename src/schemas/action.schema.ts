import { z } from 'zod';

export const ActionSchema = z.object({
  id: z.string().nonempty(),
  icon_type: z.enum(['emoji', 'image']),
  icon_value: z.string(),
  label: z.string().nonempty('CTA label should not be empty'),
  description: z.string().nullable(),
  is_archived: z.boolean().default(false),
  is_disabled: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Action = z.infer<typeof ActionSchema>;

export const ActionFieldSchema = z.object({
  id: z.string().nonempty(),
  action_id: ActionSchema.shape.id,
  name: z.string().nonempty('Name should not be empty'),
  label: z.string().nonempty('Label should not be empty'),
  type: z.enum(['text', 'textarea', 'file']),
  placeholder: z.string().nullable(),
  helper_text: z.string().nonempty('Helper text should not be empty').nullable(),
  is_required: z.boolean().default(true),
});

export type ActionField = z.infer<typeof ActionFieldSchema>;

export const CreateActionSchema = ActionSchema.pick({
  icon_type: true,
  icon_value: true,
  label: true,
  description: true,
});

export type CreateActionSchema = z.infer<typeof CreateActionSchema>;

export const UpdateActionSchema = ActionSchema.pick({
  icon_type: true,
  icon_value: true,
  label: true,
  description: true,
});

export type UpdateActionSchema = z.infer<typeof UpdateActionSchema>;
