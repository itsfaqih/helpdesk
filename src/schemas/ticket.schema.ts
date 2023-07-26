import { z } from "zod";
import { ClientSchema } from "./client.schema";

export const TicketStatusEnum = z.enum([
  "open",
  "in_progress",
  "resolved",
  "unresolved",
]);

export type TicketStatus = z.infer<typeof TicketStatusEnum>;

export const TicketSchema = z.object({
  id: z.string().nonempty(),
  title: z.string().nonempty("Title is required"),
  description: z.string().optional(),
  platform: z.string().nonempty("Platform is required"),
  status: TicketStatusEnum.default("open"),
  is_archived: z.boolean().default(false),
  client_id: z.string().nonempty(),
  category_id: z.string().nonempty(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Ticket = z.infer<typeof TicketSchema>;

export const TicketWithRelationsSchema = TicketSchema.extend({
  client: z.lazy(() => ClientSchema),
  category: z.lazy(() => TicketCategorySchema),
});

export type TicketWithRelationsSchema = z.infer<
  typeof TicketWithRelationsSchema
>;

export const CreateTicketSchema = TicketSchema.pick({
  title: true,
  description: true,
  platform: true,
  client_id: true,
  category_id: true,
}).extend({
  initial_message: z.string().nonempty("Initial message is required"),
});

export type CreateTicketSchema = z.infer<typeof CreateTicketSchema>;

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
