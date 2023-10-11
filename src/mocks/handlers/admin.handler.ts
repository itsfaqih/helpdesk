import { AdminIndexRequestSchema } from "@/queries/admin.query";
import {
  CreateAdminSchema,
  AdminSchema,
  Admin,
  UpdateAdminSchema,
} from "@/schemas/admin.schema";
import { generatePaginationMeta } from "@/utils/api.util";
import localforage from "localforage";
import { rest } from "msw";
import { nanoid } from "nanoid";
import {
  allowAuthenticatedOnly,
  allowSuperAdminOnly,
  errorResponse,
  handleResponseError,
  successResponse,
} from "../mock-utils";
import { NotFoundError, UnprocessableEntityError } from "@/utils/error.util";
import { getAdmins } from "../records/admin.record";
import { getTicketAssignmentsWithRelationsByTicketId } from "../records/ticket-assignment.record";
import { TicketAssignmentWithRelations } from "@/schemas/ticket.schema";

export const adminHandlers = [
  rest.post("/api/admins", async (req) => {
    try {
      await allowSuperAdminOnly({ sessionId: req.cookies.sessionId });

      const data = CreateAdminSchema.parse(await req.json());

      const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
      const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

      const isAdminExisted = storedAdmins.some(
        (admin) => admin.email === data.email
      );

      if (isAdminExisted) {
        throw new UnprocessableEntityError("Email is already registered");
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

      const newAdmins = [...storedAdmins, newAdmin];

      await localforage.setItem("admins", newAdmins);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...newAdminWithoutPassword } = newAdmin;

      return successResponse({
        data: newAdminWithoutPassword,
        message: "Successfully created admin",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/admins/:adminId", async (req) => {
    try {
      await allowSuperAdminOnly({ sessionId: req.cookies.sessionId });

      const data = UpdateAdminSchema.parse(await req.json());

      const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
      const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

      const adminId = req.params.adminId;

      const adminToUpdate = storedAdmins.find((admin) => admin.id === adminId);

      if (!adminToUpdate) {
        throw new NotFoundError("Admin is not found");
      }

      const updatedAdmin: Admin = {
        ...adminToUpdate,
        full_name: data.full_name,
        role: data.role,
        updated_at: new Date().toISOString(),
      };

      const newAdmins = storedAdmins.map((admin) =>
        admin.id === adminId ? updatedAdmin : admin
      );

      await localforage.setItem("admins", newAdmins);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...updatedAdminWithoutPassword } = updatedAdmin;

      return successResponse({
        data: updatedAdminWithoutPassword,
        message: "Successfully updated admin",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.get("/api/admins", async (req) => {
    try {
      await allowAuthenticatedOnly({ sessionId: req.cookies.sessionId });

      const storedAdmins = await getAdmins();

      const unparsedFilters = Object.fromEntries(req.url.searchParams);
      const filters = AdminIndexRequestSchema.parse(unparsedFilters);

      let storedTicketAssignments: TicketAssignmentWithRelations[] = [];

      if (filters.assignable_ticket_id) {
        storedTicketAssignments =
          await getTicketAssignmentsWithRelationsByTicketId({
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
          if (
            storedTicketAssignments.some(
              (assignment) => assignment.admin_id === admin.id
            )
          ) {
            return false;
          }
        }

        if (filters.is_active) {
          if (filters.is_active === "1" && !admin.is_active) {
            return false;
          } else if (filters.is_active === "0" && admin.is_active) {
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
        message: "Successfully retrieved admins",
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
  rest.get("/api/admins/:adminId", async (req) => {
    try {
      await allowAuthenticatedOnly({ sessionId: req.cookies.sessionId });

      const storedAdmins = await getAdmins();

      const adminId = req.params.adminId;

      const admin = storedAdmins.find((admin) => admin.id === adminId);

      if (!admin) {
        return errorResponse({
          message: "Admin is not found",
          status: 404,
        });
      }

      return successResponse({
        data: admin,
        message: "Successfully retrieved admin",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/admins/:adminId/deactivate", async (req) => {
    try {
      await allowSuperAdminOnly({ sessionId: req.cookies.sessionId });

      const storedAdmins = await getAdmins();

      const adminId = req.params.adminId;

      const adminToUpdate = storedAdmins.find((admin) => admin.id === adminId);

      if (!adminToUpdate) {
        throw new NotFoundError("Admin is not found");
      }

      const updatedAdmin: Admin = {
        ...adminToUpdate,
        is_active: false,
        updated_at: new Date().toISOString(),
      };

      const newAdmins = storedAdmins.map((admin) =>
        admin.id === adminId ? updatedAdmin : admin
      );

      await localforage.setItem("admins", newAdmins);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...updatedAdminWithoutPassword } = updatedAdmin;

      return successResponse({
        data: updatedAdminWithoutPassword,
        message: "Successfully deactivated admin",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/admins/:adminId/activate", async (req) => {
    try {
      await allowSuperAdminOnly({ sessionId: req.cookies.sessionId });

      const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
      const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

      const adminId = req.params.adminId;

      const adminToUpdate = storedAdmins.find((admin) => admin.id === adminId);

      if (!adminToUpdate) {
        return errorResponse({
          message: "Admin is not found",
          status: 404,
        });
      }

      const updatedAdmin: Admin = {
        ...adminToUpdate,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      const newAdmins = storedAdmins.map((admin) =>
        admin.id === adminId ? updatedAdmin : admin
      );

      await localforage.setItem("admins", newAdmins);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...updatedAdminWithoutPassword } = updatedAdmin;

      return successResponse({
        data: updatedAdminWithoutPassword,
        message: "Successfully activated admin",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
