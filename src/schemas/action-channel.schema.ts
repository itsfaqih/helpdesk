import { z } from 'zod';
import { ChannelSchema } from './channel.schema';
import { ActionSchema } from './action.schema';

export const ActionChannelSchema = z.object({
  id: z.string().nonempty(),
  channel_id: ChannelSchema.shape.id,
  action_id: ActionSchema.shape.id,
});
