import { User } from '@/schemas/user.schema';
import { LoginSchema, RegisterSchema } from '@/schemas/auth.schema';
import { http } from 'msw';
import { nanoid } from 'nanoid';
import { successResponse, errorResponse } from '../mock-utils';
import { db } from '../records/db';

export const authHandlers = [
  http.post('/api/login', async ({ request }) => {
    const data = LoginSchema.parse(await request.json());

    const user = await db.users
      .where({
        email: data.email,
        password: data.password,
      })
      .first();

    if (user) {
      return successResponse({
        data: user,
        message: 'Successfully authenticated',
        httpResponseInit: {
          headers: {
            'Set-Cookie': `sessionId=${user.id}; Max-Age=3600; Path=/`,
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

    const isUserExisted = (await db.users.where({ email: data.email }).count()) > 0;

    if (isUserExisted) {
      return errorResponse({
        message: 'Email is already registered',
        status: 409,
      });
    }

    const newUser: User = {
      id: nanoid(),
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      role: 'super_admin',
      is_active: true,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.users.add(newUser);

    const { password: _, ...newUserWithoutPassword } = newUser;

    return successResponse({
      data: newUserWithoutPassword,
      message: 'Successfully registered user',
      httpResponseInit: {
        headers: {
          'Set-Cookie': `sessionId=${newUser.id}; Max-Age=3600; Path=/`,
        },
      },
    });
  }),
  http.get('/api/me', async ({ cookies }) => {
    if (!cookies.sessionId) {
      return errorResponse({
        message: 'Unauthorized',
        status: 401,
      });
    }

    const loggedInUser = await db.users.where({ id: cookies.sessionId }).first();

    if (!loggedInUser) {
      return errorResponse({
        message: 'Unauthorized',
        status: 401,
      });
    }

    return successResponse({
      data: loggedInUser,
      message: 'Successfully retrieved current user',
    });
  }),
  http.post('/api/logout', async () => {
    return successResponse({
      message: 'Successfully logged out',
      data: null,
      httpResponseInit: {
        headers: {
          'Set-Cookie': `sessionId=; Max-Age=0; Path=/`,
        },
      },
    });
  }),
];
