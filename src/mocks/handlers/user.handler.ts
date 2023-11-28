import { UserIndexRequestSchema } from '@/queries/user.query';
import { CreateUserSchema, User, UpdateUserSchema } from '@/schemas/user.schema';
import { generatePaginationMeta } from '@/utils/api.util';
import { http } from 'msw';
import { nanoid } from 'nanoid';
import {
  allowAuthenticatedOnly,
  allowSuperUserOnly,
  errorResponse,
  handleResponseError,
  successResponse,
} from '../mock-utils';
import { NotFoundError, UnprocessableEntityError } from '@/utils/error.util';
import { getUsers } from '../records/user.record';
import { getTicketAssignmentsWithRelationsByTicketId } from '../records/ticket-assignment.record';
import { TicketAssignmentWithRelations } from '@/schemas/ticket.schema';
import { db } from '../records/db';

export const userHandlers = [
  http.post('/api/users', async ({ cookies, request }) => {
    try {
      await allowSuperUserOnly({ sessionId: cookies.sessionId });

      const data = CreateUserSchema.parse(await request.json());

      const isUserExisted = (await db.users.where('email').equals(data.email).count()) > 0;

      if (isUserExisted) {
        throw new UnprocessableEntityError('Email is already registered');
      }

      const newUser: User = {
        id: nanoid(),
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        role: data.role,
        is_active: true,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.users.add(newUser);

      const { password: _, ...newUserWithoutPassword } = newUser;

      return successResponse({
        data: newUserWithoutPassword,
        message: 'Successfully created user',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/users/:userId', async ({ request, cookies, params }) => {
    try {
      await allowSuperUserOnly({ sessionId: cookies.sessionId });

      const data = UpdateUserSchema.parse(await request.json());

      const userId = params.userId;

      const updatedRecordsCount = await db.users.update(userId, {
        full_name: data.full_name,
        role: data.role,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('User is not found');
      }

      const updatedUser = await db.users.get(userId);

      if (!updatedUser) {
        throw new NotFoundError('User is not found');
      }

      const { password: _, ...updatedUserWithoutPassword } = updatedUser;

      return successResponse({
        data: updatedUserWithoutPassword,
        message: 'Successfully updated user',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/users', async ({ cookies, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const storedUsers = await getUsers();

      const unparsedFilters = Object.fromEntries(new URL(request.url).searchParams);
      const filters = UserIndexRequestSchema.parse(unparsedFilters);

      let storedTicketAssignments: TicketAssignmentWithRelations[] = [];

      if (filters.assignable_ticket_id) {
        storedTicketAssignments = await getTicketAssignmentsWithRelationsByTicketId({
          ticketId: filters.assignable_ticket_id,
        });
      }

      const filteredUsers = storedUsers.filter((user) => {
        if (filters.search) {
          const search = filters.search.toLowerCase();

          const isMatched =
            user.full_name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search);

          if (!isMatched) {
            return false;
          }
        }

        if (filters.role) {
          if (user.role !== filters.role) {
            return false;
          }
        }

        if (filters.assignable_ticket_id) {
          if (storedTicketAssignments.some((assignment) => assignment.user_id === user.id)) {
            return false;
          }
        }

        if (filters.is_active) {
          if (filters.is_active === '1' && !user.is_active) {
            return false;
          } else if (filters.is_active === '0' && user.is_active) {
            return false;
          }
        }

        if (filters.is_archived) {
          if (filters.is_archived === '1' && !user.is_archived) {
            return false;
          } else if (filters.is_archived === '0' && user.is_archived) {
            return false;
          }
        } else {
          if (user.is_archived) {
            return false;
          }
        }

        return true;
      });

      const sortedUsers = filteredUsers.sort((a, b) => {
        if (a.updated_at > b.updated_at) {
          return -1;
        } else if (a.updated_at < b.updated_at) {
          return 1;
        } else {
          return 0;
        }
      });

      const page = filters.page ?? 1;

      const paginatedUsers = sortedUsers.slice((page - 1) * 10, page * 10);

      return successResponse({
        data: paginatedUsers,
        message: 'Successfully retrieved users',
        meta: {
          ...generatePaginationMeta({
            currentPage: page,
            total: sortedUsers.length,
          }),
        },
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/users/:userId', async ({ cookies, params }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const storedUsers = await getUsers();

      const userId = params.userId;

      const user = storedUsers.find((user) => user.id === userId);

      if (!user) {
        return errorResponse({
          message: 'User is not found',
          status: 404,
        });
      }

      return successResponse({
        data: user,
        message: 'Successfully retrieved user',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/users/:userId/deactivate', async ({ cookies, params }) => {
    try {
      await allowSuperUserOnly({ sessionId: cookies.sessionId });

      const userId = params.userId;

      const updatedRecordsCount = await db.users.update(userId, {
        is_active: false,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('User is not found');
      }

      const updatedUser = await db.users.get(userId);

      if (!updatedUser) {
        throw new NotFoundError('User is not found');
      }

      const { password: _, ...updatedUserWithoutPassword } = updatedUser;

      return successResponse({
        data: updatedUserWithoutPassword,
        message: 'Successfully deactivated user',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/users/:userId/activate', async ({ cookies, params }) => {
    try {
      await allowSuperUserOnly({ sessionId: cookies.sessionId });

      const userId = params.userId;

      const updatedRecordsCount = await db.users.update(userId, {
        is_active: true,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('User is not found');
      }

      const updatedUser = await db.users.get(userId);

      if (!updatedUser) {
        throw new NotFoundError('User is not found');
      }

      const { password: _, ...updatedUserWithoutPassword } = updatedUser;

      return successResponse({
        data: updatedUserWithoutPassword,
        message: 'Successfully activated user',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/users/:userId/archive', async ({ cookies, params }) => {
    try {
      await allowSuperUserOnly({ sessionId: cookies.sessionId });

      const userId = params.userId;

      const updatedRecordsCount = await db.users.update(userId, {
        is_archived: true,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('User is not found');
      }

      const updatedUser = await db.users.get(userId);

      if (!updatedUser) {
        throw new NotFoundError('User is not found');
      }

      const { password: _, ...updatedUserWithoutPassword } = updatedUser;

      return successResponse({
        data: updatedUserWithoutPassword,
        message: 'Successfully archived user',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/users/:userId/restore', async ({ cookies, params }) => {
    try {
      await allowSuperUserOnly({ sessionId: cookies.sessionId });

      const userId = params.userId;

      const updatedRecordsCount = await db.users.update(userId, {
        is_archived: false,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('User is not found');
      }

      const updatedUser = await db.users.get(userId);

      if (!updatedUser) {
        throw new NotFoundError('User is not found');
      }

      const { password: _, ...updatedUserWithoutPassword } = updatedUser;

      return successResponse({
        data: updatedUserWithoutPassword,
        message: 'Successfully unarchived user',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
