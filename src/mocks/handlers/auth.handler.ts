import { Admin } from '@/schemas/admin.schema';
import { LoginSchema, RegisterSchema } from '@/schemas/auth.schema';
import { http } from 'msw';
import { nanoid } from 'nanoid';
import { successResponse, errorResponse } from '../mock-utils';
import { db } from '../records/db';

export const authHandlers = [
  http.post('/api/login', async ({ request }) => {
    const data = LoginSchema.parse(await request.json());

    const admin = await db.admins
      .where({
        email: data.email,
        password: data.password,
      })
      .first();

    if (admin) {
      return successResponse({
        data: admin,
        message: 'Successfully authenticated',
        httpResponseInit: {
          headers: {
            'Set-Cookie': `sessionId=${admin.id}`,
          },
        },
      });
    }

    return errorResponse({
      message: 'Email or password is invalid',
      status: 401,
    });
  }),
  http.post('/api/register', async ({ request }) => {
    const data = RegisterSchema.parse(await request.json());

    const isAdminExisted = (await db.admins.where({ email: data.email }).count()) > 0;

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

    await db.admins.add(newAdmin);

    const { password: _, ...newAdminWithoutPassword } = newAdmin;

    return successResponse({
      data: newAdminWithoutPassword,
      message: 'Successfully registered admin',
      httpResponseInit: {
        headers: {
          'Set-Cookie': `sessionId=${newAdmin.id}`,
        },
      },
    });
  }),
  http.get('/api/me', async ({ cookies }) => {
    const loggedInAdmin = await db.admins.where({ id: cookies.sessionId }).first();

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
  http.post('/api/logout', async () => {
    return successResponse({
      message: 'Successfully logged out',
      data: null,
      httpResponseInit: {
        headers: {
          'Set-Cookie': `sessionId=; Max-Age=0`,
        },
      },
    });
  }),
];
