import { z } from 'zod';

export const UserRoleEnum = z.enum(['super_admin', 'operator']);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const UserSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.enum(UserRoleEnum.options),
  is_active: z.boolean(),
  is_archived: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const UserWithoutPasswordSchema = UserSchema.omit({ password: true });

export type UserWithoutPassword = z.infer<typeof UserWithoutPasswordSchema>;

export const CreateUserSchema = UserSchema.pick({
  full_name: true,
  email: true,
  password: true,
  role: true,
});

export type CreateUserSchema = z.infer<typeof CreateUserSchema>;

export const CreateUserFormSchema = z.object({
  full_name: z.string().min(1, { message: 'Full name must not be empty' }).default(''),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Email must not be empty' })
    .default(''),
  role: z.enum(UserRoleEnum.options, {
    required_error: 'Role must not be empty',
  }),
});

export type CreateUserFormSchema = z.infer<typeof CreateUserFormSchema>;

export const UpdateUserSchema = UserSchema.pick({
  full_name: true,
  role: true,
});

export type UpdateUserSchema = z.infer<typeof UpdateUserSchema>;

export const UpdateUserFormSchema = z.object({
  full_name: z.string().min(1, { message: 'Full name must not be empty' }).default(''),
  role: z.enum(UserRoleEnum.options, {
    required_error: 'Role must not be empty',
  }),
});
