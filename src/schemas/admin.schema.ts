import { z } from "zod";

export const AdminSchema = z.object({
  id: z.string().nonempty(),
  full_name: z.string().nonempty("Full name is required"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .nonempty("Email is required"),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .nonempty("Password is required"),
  role: z.enum(["super_admin", "operator"], {
    required_error: "Role is required",
  }),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Admin = z.infer<typeof AdminSchema>;

export const AdminWithoutPasswordSchema = AdminSchema.omit({ password: true });

export type AdminWithoutPassword = z.infer<typeof AdminWithoutPasswordSchema>;

export const CreateAdminSchema = AdminSchema.pick({
  full_name: true,
  email: true,
  password: true,
  role: true,
});

export type CreateAdminSchema = z.infer<typeof CreateAdminSchema>;

export const UpdateAdminSchema = AdminSchema.pick({
  full_name: true,
  role: true,
});

export type UpdateAdminSchema = z.infer<typeof UpdateAdminSchema>;
