import { z } from "zod";
import { ClientSchema } from "./client.schema";
import { ChannelSchema } from "./channel.schema";
import { AdminSchema } from "./admin.schema";

export const TicketStatusEnum = z.enum([
  "open",
  "in_progress",
  "resolved",
  "unresolved",
]);

export type TicketStatus = z.infer<typeof TicketStatusEnum>;

export const TicketCategorySchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  is_archived: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TicketCategory = z.infer<typeof TicketCategorySchema>;

export const CreateTicketCategorySchema = TicketCategorySchema.pick({
  name: true,
  description: true,
});

export type CreateTicketCategorySchema = z.infer<
  typeof CreateTicketCategorySchema
>;

export const UpdateTicketCategorySchema = TicketCategorySchema.pick({
  description: true,
});

export type UpdateTicketCategorySchema = z.infer<
  typeof UpdateTicketCategorySchema
>;

export const TicketSchema = z.object({
  id: z.string().nonempty(),
  title: z.string().nonempty("Title is required"),
  description: z.string().optional(),
  status: TicketStatusEnum.default("open"),
  is_archived: z.boolean().default(false),
  category_id: TicketCategorySchema.shape.id,
  channel_id: ChannelSchema.shape.id,
  client_id: ClientSchema.shape.id,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Ticket = z.infer<typeof TicketSchema>;

export const TicketWithRelationsSchema = TicketSchema.extend({
  assignments: z.lazy(() => TicketAssignmentWithRelationsSchema.array()),
  category: z.lazy(() => TicketCategorySchema),
  channel: z.lazy(() => ChannelSchema),
  client: z.lazy(() => ClientSchema),
});

export type TicketWithRelations = z.infer<typeof TicketWithRelationsSchema>;

export const CreateTicketSchema = TicketSchema.pick({
  title: true,
  description: true,
  category_id: true,
  channel_id: true,
  client_id: true,
}).extend({
  initial_message: z.string().nonempty("Initial message is required"),
});

export type CreateTicketSchema = z.infer<typeof CreateTicketSchema>;

export const TicketAssignmentSchema = z.object({
  id: z.string().nonempty(),
  ticket_id: TicketSchema.shape.id,
  admin_id: AdminSchema.shape.id,
  created_at: z.string().datetime(),
  deleted_at: z.string().datetime().optional(),
});

export type TicketAssignment = z.infer<typeof TicketAssignmentSchema>;

export const CreateTicketAssignmentSchema = TicketAssignmentSchema.pick({
  ticket_id: true,
  admin_id: true,
});

export type CreateTicketAssignmentSchema = z.infer<
  typeof CreateTicketAssignmentSchema
>;

export const DeleteTicketAssignmentSchema = TicketAssignmentSchema.pick({
  id: true,
  ticket_id: true,
});

export type DeleteTicketAssignmentSchema = z.infer<
  typeof DeleteTicketAssignmentSchema
>;

export const TicketAssignmentWithRelationsSchema =
  TicketAssignmentSchema.extend({
    ticket: z.lazy(() => TicketSchema),
    admin: z.lazy(() => AdminSchema),
  });

export type TicketAssignmentWithRelations = z.infer<
  typeof TicketAssignmentWithRelationsSchema
>;
