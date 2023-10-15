import { AdminSchema, Admin } from '@/schemas/admin.schema';
import { LoginSchema, RegisterSchema } from '@/schemas/auth.schema';
import localforage from 'localforage';
import { rest } from 'msw';
import { nanoid } from 'nanoid';
import { successResponse, errorResponse } from '../mock-utils';

export const authHandlers = [
  rest.post('/api/login', async (req, _, ctx) => {
    const data = LoginSchema.parse(await req.json());
    const unparsedStoredAdmins = (await localforage.getItem('admins')) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const admin = storedAdmins.find(
      (admin) => admin.email === data.email && admin.password === data.password,
    );

    if (admin) {
      return successResponse({
        data: admin,
        message: 'Successfully authenticated',
        transformers: [ctx.cookie('sessionId', admin.id)],
      });
    }

    return errorResponse({
      message: 'Email or password is invalid',
      status: 401,
    });
  }),
  rest.post('/api/register', async (req, _, ctx) => {
    const data = RegisterSchema.parse(await req.json());
    const unparsedStoredAdmins = (await localforage.getItem('admins')) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const isAdminExisted = storedAdmins.some((admin) => admin.email === data.email);

    if (isAdminExisted) {
      return errorResponse({
        message: 'Email is already registered',
        status: 409,
      });
    }

    const newAdmin: Admin = {
      id: nanoid(),
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      role: 'super_admin',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newAdmins = [...storedAdmins, newAdmin];

    await localforage.setItem('admins', newAdmins);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...newAdminWithoutPassword } = newAdmin;

    return successResponse({
      data: newAdminWithoutPassword,
      message: 'Successfully registered admin',
      transformers: [ctx.cookie('sessionId', newAdmin.id)],
    });
  }),
  rest.get('/api/me', async (req) => {
    const { sessionId } = req.cookies;

    const unparsedStoredAdmins = (await localforage.getItem('admins')) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const loggedInAdmin = storedAdmins.find((admin) => admin.id === sessionId);

    if (!loggedInAdmin) {
      return errorResponse({
        message: 'Unauthorized',
        status: 401,
      });
    }

    return successResponse({
      data: loggedInAdmin,
      message: 'Successfully retrieved current admin',
    });
  }),
  rest.post('/api/logout', async (_, __, ctx) => {
    return successResponse({
      message: 'Successfully logged out',
      data: null,
      transformers: [ctx.cookie('sessionId', '', { maxAge: 0 })],
    });
  }),
];
