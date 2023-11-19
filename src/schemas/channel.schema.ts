import { z } from 'zod';

export const ChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  is_archived: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Channel = z.infer<typeof ChannelSchema>;

export const CreateChannelSchema = ChannelSchema.pick({
  name: true,
  description: true,
});

export type CreateChannelSchema = z.infer<typeof CreateChannelSchema>;

export const CreateChannelFormSchema = z.object({
  name: z.string().min(1, { message: 'Name must not be empty' }).default(''),
  description: z.string().default(''),
});

export type CreateChannelFormSchema = z.infer<typeof CreateChannelFormSchema>;

export const UpdateChannelSchema = ChannelSchema.pick({
  description: true,
});

export type UpdateChannelSchema = z.infer<typeof UpdateChannelSchema>;

export const UpdateChannelFormSchema = z.object({
  description: z.string().default(''),
});

export type UpdateChannelFormSchema = z.infer<typeof UpdateChannelFormSchema>;
