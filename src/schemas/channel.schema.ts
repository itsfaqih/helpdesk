import { z } from "zod";

export const ChannelSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty("Name is required"),
  is_archived: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Channel = z.infer<typeof ChannelSchema>;

export const CreateChannelSchema = ChannelSchema.pick({
  name: true,
});

export type CreateChannelSchema = z.infer<typeof CreateChannelSchema>;
