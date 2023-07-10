import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().nonempty(),
  full_name: z.string().nonempty(),
  email: z.string().email().nonempty(),
  password: z.string().nonempty(),
});

export type User = z.infer<typeof UserSchema>;
