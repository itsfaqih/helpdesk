import { AdminIndexRequestSchema } from '@/queries/admin.query';
import { CreateAdminSchema, Admin, UpdateAdminSchema } from '@/schemas/admin.schema';
import { generatePaginationMeta } from '@/utils/api.util';
import { http } from 'msw';
import { nanoid } from 'nanoid';
import {
  allowAuthenticatedOnly,
  allowSuperAdminOnly,
  errorResponse,
  handleResponseError,
  successResponse,
} from '../mock-utils';
import { NotFoundError, UnprocessableEntityError } from '@/utils/error.util';
import { getAdmins } from '../records/admin.record';
import { getTicketAssignmentsWithRelationsByTicketId } from '../records/ticket-assignment.record';
import { TicketAssignmentWithRelations } from '@/schemas/ticket.schema';
import { db } from '../records/db';

export const adminHandlers = [
  http.post('/api/admins', async ({ cookies, request }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const data = CreateAdminSchema.parse(await request.json());

      const isAdminExisted = (await db.admins.where('email').equals(data.email).count()) > 0;

      if (isAdminExisted) {
        throw new UnprocessableEntityError('Email is already registered');
      }

      const newAdmin: Admin = {
        id: nanoid(),
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        role: data.role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.admins.add(newAdmin);

      const { password: _, ...newAdminWithoutPassword } = newAdmin;

      return successResponse({
        data: newAdminWithoutPassword,
        message: 'Successfully created admin',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/admins/:adminId', async ({ request, cookies, params }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const data = UpdateAdminSchema.parse(await request.json());

      const adminId = params.adminId;

      const updatedRecordsCount = await db.admins.update(adminId, {
        full_name: data.full_name,
        role: data.role,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('Admin is not found');
      }

      const updatedAdmin = await db.admins.get(adminId);

      if (!updatedAdmin) {
        throw new NotFoundError('Admin is not found');
      }

      const { password: _, ...updatedAdminWithoutPassword } = updatedAdmin;

      return successResponse({
        data: updatedAdminWithoutPassword,
        message: 'Successfully updated admin',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/admins', async ({ cookies, request }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const storedAdmins = await getAdmins();

      const unparsedFilters = Object.fromEntries(new URL(request.url).searchParams);
      const filters = AdminIndexRequestSchema.parse(unparsedFilters);

      let storedTicketAssignments: TicketAssignmentWithRelations[] = [];

      if (filters.assignable_ticket_id) {
        storedTicketAssignments = await getTicketAssignmentsWithRelationsByTicketId({
          ticketId: filters.assignable_ticket_id,
        });
      }

      // return successResponse({
      //   data: storedTicketAssignments.some(
      //     (assignment) => assignment.admin_id === "super-admin-id"
      //   ),
      //   message: "Successfully retrieved admins",
      // });

      const filteredAdmins = storedAdmins.filter((admin) => {
        if (filters.search) {
          const search = filters.search.toLowerCase();

          const isMatched =
            admin.full_name.toLowerCase().includes(search) ||
            admin.email.toLowerCase().includes(search);

          if (!isMatched) {
            return false;
          }
        }

        if (filters.role) {
          if (admin.role !== filters.role) {
            return false;
          }
        }

        if (filters.assignable_ticket_id) {
          if (storedTicketAssignments.some((assignment) => assignment.admin_id === admin.id)) {
            return false;
          }
        }

        if (filters.is_active) {
          if (filters.is_active === '1' && !admin.is_active) {
            return false;
          } else if (filters.is_active === '0' && admin.is_active) {
            return false;
          }
        } else {
          return admin.is_active;
        }

        return true;
      });

      const sortedAdmins = filteredAdmins.sort((a, b) => {
        if (a.updated_at > b.updated_at) {
          return -1;
        } else if (a.updated_at < b.updated_at) {
          return 1;
        } else {
          return 0;
        }
      });

      const page = filters.page ?? 1;

      const paginatedAdmins = sortedAdmins.slice((page - 1) * 10, page * 10);

      return successResponse({
        data: paginatedAdmins,
        message: 'Successfully retrieved admins',
        meta: {
          ...generatePaginationMeta({
            currentPage: page,
            total: sortedAdmins.length,
          }),
        },
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.get('/api/admins/:adminId', async ({ cookies, params }) => {
    try {
      await allowAuthenticatedOnly({ sessionId: cookies.sessionId });

      const storedAdmins = await getAdmins();

      const adminId = params.adminId;

      const admin = storedAdmins.find((admin) => admin.id === adminId);

      if (!admin) {
        return errorResponse({
          message: 'Admin is not found',
          status: 404,
        });
      }

      return successResponse({
        data: admin,
        message: 'Successfully retrieved admin',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/admins/:adminId/deactivate', async ({ cookies, params }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const adminId = params.adminId;

      const updatedRecordsCount = await db.admins.update(adminId, {
        is_active: false,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('Admin is not found');
      }

      const updatedAdmin = await db.admins.get(adminId);

      if (!updatedAdmin) {
        throw new NotFoundError('Admin is not found');
      }

      const { password: _, ...updatedAdminWithoutPassword } = updatedAdmin;

      return successResponse({
        data: updatedAdminWithoutPassword,
        message: 'Successfully deactivated admin',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  http.put('/api/admins/:adminId/activate', async ({ cookies, params }) => {
    try {
      await allowSuperAdminOnly({ sessionId: cookies.sessionId });

      const adminId = params.adminId;

      const updatedRecordsCount = await db.admins.update(adminId, {
        is_active: true,
        updated_at: new Date().toISOString(),
      });

      if (updatedRecordsCount === 0) {
        throw new NotFoundError('Admin is not found');
      }

      const updatedAdmin = await db.admins.get(adminId);

      if (!updatedAdmin) {
        throw new NotFoundError('Admin is not found');
      }

      const { password: _, ...updatedAdminWithoutPassword } = updatedAdmin;

      return successResponse({
        data: updatedAdminWithoutPassword,
        message: 'Successfully activated admin',
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
