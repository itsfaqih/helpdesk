import { z } from "zod";

export const ChannelSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty("Name is required"),
  description: z.string().nonempty("Name is required").nullable(),
  is_archived: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Channel = z.infer<typeof ChannelSchema>;

export const CreateChannelSchema = ChannelSchema.pick({
  name: true,
  description: true,
});

export type CreateChannelSchema = z.infer<typeof CreateChannelSchema>;

export const UpdateChannelSchema = ChannelSchema.pick({
  description: true,
});

export type UpdateChannelSchema = z.infer<typeof UpdateChannelSchema>;
