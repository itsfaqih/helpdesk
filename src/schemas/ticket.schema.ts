import { z } from "zod";

export const TicketSchema = z.object({
  id: z.string().nonempty(),
  title: z.string().nonempty("Title is required"),
  status: z
    .enum(["open", "in_progress", "resolved", "unresolved"])
    .default("open"),
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

export const TicketMessageSchema = z.object({
  id: z.string().nonempty(),
  message: z.string().nonempty(),
  ticket_id: z.string().nonempty(),
  messageable_id: z.string().nonempty(),
  messageable_type: z.enum(["client", "admin"]),
  created_at: z.string().datetime(),
});

export type TicketMessage = z.infer<typeof TicketMessageSchema>;
