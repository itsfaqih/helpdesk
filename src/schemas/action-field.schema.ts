import { z } from 'zod';
import { ActionSchema } from './action.schema';

export const ActionFieldTypeEnum = z.enum(['text', 'textarea', 'file']);

type ActionFieldType = z.infer<typeof ActionFieldTypeEnum>;

function actionFieldTypeValueToLabel(actionFieldType: ActionFieldType) {
  switch (actionFieldType) {
    case 'text':
      return 'Text';
    case 'textarea':
      return 'Textarea';
    case 'file':
      return 'File';
  }
}

export const actionFieldTypeOptions = ActionFieldTypeEnum.options.map((actionFieldType) => ({
  value: actionFieldType,
  label: actionFieldTypeValueToLabel(actionFieldType),
}));

export const ActionFieldSchema = z.object({
  id: z.string(),
  action_id: ActionSchema.shape.id,
  name: z.string(),
  label: z.string(),
  type: ActionFieldTypeEnum,
  placeholder: z.string(),
  helper_text: z.string(),
  is_required: z.boolean().default(true),
  order: z.number(),
});

export type ActionField = z.infer<typeof ActionFieldSchema>;

export const CreateActionFieldSchema = ActionFieldSchema.pick({
  action_id: true,
  name: true,
  label: true,
  type: true,
  placeholder: true,
  helper_text: true,
  is_required: true,
});

export type CreateActionFieldSchema = z.infer<typeof CreateActionFieldSchema>;

export const UpdateActionFieldSchema = CreateActionFieldSchema.pick({
  name: true,
  label: true,
  type: true,
  placeholder: true,
  helper_text: true,
  is_required: true,
})
  .partial()
  .extend({
    id: ActionFieldSchema.shape.id,
    action_id: ActionSchema.shape.id,
    order: ActionFieldSchema.shape.order.optional(),
  });

export type UpdateActionFieldSchema = z.infer<typeof UpdateActionFieldSchema>;

export const DeleteActionFieldSchema = ActionFieldSchema.pick({
  id: true,
  action_id: true,
});

export type DeleteActionFieldSchema = z.infer<typeof DeleteActionFieldSchema>;

export const CreateActionFieldFormSchema = z.object({
  action_id: z.string().min(1, { message: 'Please select an action' }).default(''),
  name: z.string().min(1, { message: 'Please enter a name' }).default(''),
  label: z.string().min(1, { message: 'Please enter a label' }).default(''),
  type: z.enum(ActionFieldTypeEnum.options, {
    required_error: 'Please select a type',
  }),
  placeholder: z.string().default(''),
  helper_text: z.string().default(''),
  is_required: z.boolean().default(true),
});

export type CreateActionFieldForm = z.infer<typeof CreateActionFieldFormSchema>;

export const UpdateActionFieldFormSchema = CreateActionFieldFormSchema.pick({
  name: true,
  label: true,
  type: true,
  placeholder: true,
  helper_text: true,
  is_required: true,
});

export type UpdateActionFieldForm = z.infer<typeof UpdateActionFieldFormSchema>;
