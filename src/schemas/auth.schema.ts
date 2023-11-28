import { z } from 'zod';
import { APIResponseSchema } from './api.schema';
import { UserWithoutPasswordSchema } from './user.schema';

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().nonempty('Password is required'),
  remember_me: z.boolean().default(false),
});

export type LoginSchema = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    full_name: z.string().nonempty({ message: 'Full name is required' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirm_password: z
      .string()
      .min(8, { message: 'Confirm password must be at least 8 characters' }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password and confirm password must be the same',
    path: ['confirm_password'],
  });

export type RegisterSchema = z.infer<typeof RegisterSchema>;

export const AuthResponseSchema = APIResponseSchema({
  schema: UserWithoutPasswordSchema,
});
