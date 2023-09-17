import { z } from "zod";
import { ChannelSchema } from "./channel.schema";

export const ActionSchema = z.object({
  id: z.string().nonempty(),
  cta_icon_url: z.string().nullable(),
  cta_label: z.string().nonempty("CTA label should not be empty"),
  channel_id: ChannelSchema.shape.id,
});

export type ActionResponse = z.infer<typeof ActionSchema>;

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
