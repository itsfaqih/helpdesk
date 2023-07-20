import { z } from "zod";

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
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Ticket = z.infer<typeof TicketSchema>;

export const CreateTicketSchema = TicketSchema.pick({
  title: true,
  client_id: true,
}).extend({
  initial_message: z.string().nonempty("Initial message is required"),
});

export type CreateTicketSchema = z.infer<typeof CreateTicketSchema>;
