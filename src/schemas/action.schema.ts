import { z } from 'zod';

const ActionIconTypeEnum = z.enum(['emoji', 'image']);

export const ActionSchema = z.object({
  id: z.string(),
  icon_type: ActionIconTypeEnum,
  icon_value: z.string(),
  label: z.string(),
  description: z.string(),
  is_archived: z.boolean(),
  is_disabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Action = z.infer<typeof ActionSchema>;

export const CreateActionSchema = ActionSchema.pick({
  icon_type: true,
  icon_value: true,
  label: true,
  description: true,
});

export type CreateActionSchema = z.infer<typeof CreateActionSchema>;

export const CreateActionFormSchema = z.object({
  icon_type: ActionIconTypeEnum,
  icon_value: z.string().min(1, { message: 'Please select an icon' }).default(''),
  label: z.string().min(1, { message: 'Please enter a label' }).default(''),
  description: z.string().default(''),
});

export type CreateActionForm = z.infer<typeof CreateActionFormSchema>;

export const UpdateActionSchema = ActionSchema.pick({
  icon_type: true,
  icon_value: true,
  label: true,
  description: true,
});

export type UpdateActionSchema = z.infer<typeof UpdateActionSchema>;
