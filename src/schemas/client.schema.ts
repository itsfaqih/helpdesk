import { z } from "zod";

export const ClientSchema = z.object({
  id: z.string().nonempty(),
  full_name: z.string().nonempty("Full name is required"),
  is_archived: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Client = z.infer<typeof ClientSchema>;

export const CreateClientSchema = ClientSchema.pick({
  full_name: true,
});

export type CreateClientSchema = z.infer<typeof CreateClientSchema>;

export const UpdateClientSchema = ClientSchema.pick({
  full_name: true,
});

export type UpdateClientSchema = z.infer<typeof UpdateClientSchema>;
