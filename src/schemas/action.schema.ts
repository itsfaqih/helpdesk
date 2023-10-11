import { z } from "zod";

export const ActionSchema = z.object({
  id: z.string().nonempty(),
  cta_icon_type: z.enum(["emoji", "image"]),
  cta_icon_value: z.string(),
  cta_label: z.string().nonempty("CTA label should not be empty"),
  description: z.string().nullable(),
  is_archived: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Action = z.infer<typeof ActionSchema>;

export const ActionFieldSchema = z.object({
  id: z.string().nonempty(),
  action_id: ActionSchema.shape.id,
  name: z.string().nonempty("Name should not be empty"),
  label: z.string().nonempty("Label should not be empty"),
  type: z.enum(["text", "textarea", "file"]),
  placeholder: z.string().nullable(),
  helper_text: z
    .string()
    .nonempty("Helper text should not be empty")
    .nullable(),
  is_required: z.boolean().default(true),
});

export type ActionField = z.infer<typeof ActionFieldSchema>;

export const CreateActionSchema = ActionSchema.pick({
  cta_icon_type: true,
  cta_icon_value: true,
  cta_label: true,
  description: true,
});

export type CreateActionSchema = z.infer<typeof CreateActionSchema>;

export const UpdateActionSchema = ActionSchema.pick({
  cta_icon_type: true,
  cta_icon_value: true,
  cta_label: true,
  description: true,
});

export type UpdateActionSchema = z.infer<typeof UpdateActionSchema>;
