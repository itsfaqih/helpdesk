import { z } from 'zod';

const ActionIconTypeEnum = z.enum(['emoji', 'image']);

export const ActionFormMethodEnum = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

export const ActionSchema = z.object({
  id: z.string(),
  icon_type: ActionIconTypeEnum,
  icon_value: z.string(),
  label: z.string(),
  description: z.string(),
  form_method: ActionFormMethodEnum.nullable(),
  webhook_url: z.string(),
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

export const UpdateActionSchema = CreateActionSchema.partial();

export type UpdateActionSchema = z.infer<typeof UpdateActionSchema>;

export const CreateActionFormSchema = z.object({
  icon_type: ActionIconTypeEnum,
  icon_value: z.string().min(1, { message: 'Please select an icon' }).default(''),
  label: z.string().min(1, { message: 'Please enter a label' }).default(''),
  description: z.string().default(''),
  form_method: z.enum(ActionFormMethodEnum.options, {
    required_error: 'Please select a method',
  }),
  webhook_url: z
    .string()
    .min(1, { message: 'Pleace enter a URL' })
    .url({ message: 'Please enter a valid URL' })
    .default(''),
});

export type CreateActionFormSchema = z.infer<typeof CreateActionFormSchema>;

export const UpdateActionFormSchema = CreateActionFormSchema.partial();

export type UpdateActionFormSchema = z.infer<typeof UpdateActionFormSchema>;
