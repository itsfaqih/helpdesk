import { z } from 'zod';
import { ClientSchema } from './client.schema';
import { ChannelSchema } from './channel.schema';
import { UserSchema } from './user.schema';

export const TicketStatusEnum = z.enum(['open', 'in_progress', 'resolved', 'unresolved']);

export type TicketStatus = z.infer<typeof TicketStatusEnum>;

export const TicketTagSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().nullable(),
  is_archived: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TicketTag = z.infer<typeof TicketTagSchema>;

export const CreateTicketTagSchema = TicketTagSchema.pick({
  name: true,
  description: true,
});

export type CreateTicketTagSchema = z.infer<typeof CreateTicketTagSchema>;

export const UpdateTicketTagSchema = TicketTagSchema.pick({
  description: true,
});

export type UpdateTicketTagSchema = z.infer<typeof UpdateTicketTagSchema>;

export const TicketSchema = z.object({
  id: z.string().nonempty(),
  title: z.string().nonempty('Title is required'),
  description: z.string().optional(),
  status: TicketStatusEnum.default('open'),
  is_archived: z.boolean().default(false),
  channel_id: ChannelSchema.shape.id,
  client_id: ClientSchema.shape.id,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Ticket = z.infer<typeof TicketSchema>;

const TicketTaggingSchema = z.object({
  ticket_id: TicketSchema.shape.id,
  ticket_tag_id: TicketTagSchema.shape.id,
});

export type TicketTagging = z.infer<typeof TicketTaggingSchema>;

export const TicketWithRelationsSchema = TicketSchema.extend({
  assignments: z.lazy(() => TicketAssignmentWithRelationsSchema.array()),
  tags: z.lazy(() => TicketTagSchema.array()),
  channel: z.lazy(() => ChannelSchema),
  client: z.lazy(() => ClientSchema),
});

export type TicketWithRelations = z.infer<typeof TicketWithRelationsSchema>;

export const CreateTicketSchema = TicketSchema.pick({
  title: true,
  description: true,
  tag_id: true,
  channel_id: true,
  client_id: true,
}).extend({
  initial_message: z.string().nonempty('Initial message is required'),
});

export type CreateTicketSchema = z.infer<typeof CreateTicketSchema>;

export const TicketAssignmentSchema = z.object({
  id: z.string().nonempty(),
  ticket_id: TicketSchema.shape.id,
  user_id: UserSchema.shape.id,
  created_at: z.string().datetime(),
});

export type TicketAssignment = z.infer<typeof TicketAssignmentSchema>;

export const CreateTicketAssignmentSchema = TicketAssignmentSchema.pick({
  ticket_id: true,
  user_id: true,
});

export type CreateTicketAssignmentSchema = z.infer<typeof CreateTicketAssignmentSchema>;

export const DeleteTicketAssignmentSchema = TicketAssignmentSchema.pick({
  id: true,
  ticket_id: true,
});

export type DeleteTicketAssignmentSchema = z.infer<typeof DeleteTicketAssignmentSchema>;

export const TicketAssignmentWithRelationsSchema = TicketAssignmentSchema.extend({
  ticket: z.lazy(() => TicketSchema),
  user: z.lazy(() => UserSchema),
});

export type TicketAssignmentWithRelations = z.infer<typeof TicketAssignmentWithRelationsSchema>;
