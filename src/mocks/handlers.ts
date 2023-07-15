import { LoginSchema, RegisterSchema } from "@/schemas/auth.schema";
import {
  Admin,
  AdminSchema,
  AdminWithoutPasswordSchema,
  CreateAdminSchema,
  UpdateAdminSchema,
} from "@/schemas/admin.schema";
import localforage from "localforage";
import { rest } from "msw";
import { errorResponse, successResponse } from "./res";
import { nanoid } from "nanoid";
import { AdminIndexRequestSchema } from "@/queries/admin.index.query";

export const handlers = [
  rest.post("/api/login", async (req) => {
    const data = LoginSchema.parse(await req.json());
    const unparsedCurrentAdmins = (await localforage.getItem("admins")) ?? [];
    const currentAdmins = AdminSchema.array().parse(unparsedCurrentAdmins);

    const admin = currentAdmins.find(
      (admin) => admin.email === data.email && admin.password === data.password
    );

    if (admin) {
      return successResponse({
        data: admin,
        message: "Successfully authenticated",
      });
    }

    return errorResponse({
      message: "Email or password is invalid",
      status: 401,
    });
  }),
  rest.post("/api/register", async (req) => {
    const data = RegisterSchema.parse(await req.json());
    const unparsedCurrentAdmins = (await localforage.getItem("admins")) ?? [];
    const currentAdmins = AdminSchema.array().parse(unparsedCurrentAdmins);

    const isAdminExisted = currentAdmins.some(
      (admin) => admin.email === data.email
    );

    if (isAdminExisted) {
      return errorResponse({
        message: "Email is already registered",
        status: 409,
      });
    }

    const newAdmin: Admin = {
      id: nanoid(),
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      role: "super_admin",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newAdmins = [...currentAdmins, newAdmin];

    await localforage.setItem("admins", newAdmins);
    await localforage.setItem("current_admin", newAdmin);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...newAdminWithoutPassword } = newAdmin;

    return successResponse({
      data: newAdminWithoutPassword,
      message: "Successfully registered admin",
    });
  }),
  rest.get("/api/me", async () => {
    const currentAdmin = await localforage.getItem("current_admin");

    if (!currentAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const parsedCurrentAdmin = AdminWithoutPasswordSchema.parse(currentAdmin);

    return successResponse({
      data: parsedCurrentAdmin,
      message: "Successfully retrieved current admin",
    });
  }),
  rest.post("/api/admins", async (req) => {
    const currentAdmin = await localforage.getItem("current_admin");

    if (!currentAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const parsedCurrentAdmin = AdminWithoutPasswordSchema.parse(currentAdmin);

    if (parsedCurrentAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const data = CreateAdminSchema.parse(await req.json());

    const unparsedCurrentAdmins = (await localforage.getItem("admins")) ?? [];
    const currentAdmins = AdminSchema.array().parse(unparsedCurrentAdmins);

    const isAdminExisted = currentAdmins.some(
      (admin) => admin.email === data.email
    );

    if (isAdminExisted) {
      return errorResponse({
        message: "Email is already registered",
        status: 409,
      });
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

    const newAdmins = [...currentAdmins, newAdmin];

    await localforage.setItem("admins", newAdmins);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...newAdminWithoutPassword } = newAdmin;

    return successResponse({
      data: newAdminWithoutPassword,
      message: "Successfully created admin",
    });
  }),
  rest.put("/api/admins/:adminId", async (req) => {
    const currentAdmin = await localforage.getItem("current_admin");

    if (!currentAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const parsedCurrentAdmin = AdminWithoutPasswordSchema.parse(currentAdmin);

    if (parsedCurrentAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const data = UpdateAdminSchema.parse(await req.json());

    const unparsedCurrentAdmins = (await localforage.getItem("admins")) ?? [];
    const currentAdmins = AdminSchema.array().parse(unparsedCurrentAdmins);

    const adminId = req.params.adminId;

    const adminToUpdate = currentAdmins.find((admin) => admin.id === adminId);

    if (!adminToUpdate) {
      return errorResponse({
        message: "Admin is not found",
        status: 404,
      });
    }

    const updatedAdmin: Admin = {
      ...adminToUpdate,
      full_name: data.full_name,
      role: data.role,
      updated_at: new Date().toISOString(),
    };

    const newAdmins = currentAdmins.map((admin) =>
      admin.id === adminId ? updatedAdmin : admin
    );

    await localforage.setItem("admins", newAdmins);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...updatedAdminWithoutPassword } = updatedAdmin;

    return successResponse({
      data: updatedAdminWithoutPassword,
      message: "Successfully updated admin",
    });
  }),
  rest.get("/api/admins", async (req) => {
    const currentAdmin = await localforage.getItem("current_admin");

    if (!currentAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const unparsedCurrentAdmins = (await localforage.getItem("admins")) ?? [];
    const currentAdmins = AdminSchema.array().parse(unparsedCurrentAdmins);

    const unparsedFilters = Object.fromEntries(req.url.searchParams);
    const filters = AdminIndexRequestSchema.parse(unparsedFilters);

    const filteredAdmins = currentAdmins.filter((admin) => {
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

      if (filters.is_active) {
        if (admin.is_active !== (filters.is_active === "1")) {
          return false;
        }
      }

      return true;
    });

    return successResponse({
      data: filteredAdmins,
      message: "Successfully retrieved admins",
    });
  }),
  rest.put("/api/admins/:adminId/deactivate", async (req) => {
    const currentAdmin = await localforage.getItem("current_admin");

    if (!currentAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const parsedCurrentAdmin = AdminWithoutPasswordSchema.parse(currentAdmin);

    if (parsedCurrentAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const unparsedCurrentAdmins = (await localforage.getItem("admins")) ?? [];
    const currentAdmins = AdminSchema.array().parse(unparsedCurrentAdmins);

    const adminId = req.params.adminId;

    const adminToUpdate = currentAdmins.find((admin) => admin.id === adminId);

    if (!adminToUpdate) {
      return errorResponse({
        message: "Admin is not found",
        status: 404,
      });
    }

    const updatedAdmin: Admin = {
      ...adminToUpdate,
      is_active: false,
      updated_at: new Date().toISOString(),
    };

    const newAdmins = currentAdmins.map((admin) =>
      admin.id === adminId ? updatedAdmin : admin
    );

    await localforage.setItem("admins", newAdmins);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...updatedAdminWithoutPassword } = updatedAdmin;

    return successResponse({
      data: updatedAdminWithoutPassword,
      message: "Successfully deactivated admin",
    });
  }),
  rest.put("/api/admins/:adminId/activate", async (req) => {
    const currentAdmin = await localforage.getItem("current_admin");

    if (!currentAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const parsedCurrentAdmin = AdminWithoutPasswordSchema.parse(currentAdmin);

    if (parsedCurrentAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const unparsedCurrentAdmins = (await localforage.getItem("admins")) ?? [];
    const currentAdmins = AdminSchema.array().parse(unparsedCurrentAdmins);

    const adminId = req.params.adminId;

    const adminToUpdate = currentAdmins.find((admin) => admin.id === adminId);

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

    const newAdmins = currentAdmins.map((admin) =>
      admin.id === adminId ? updatedAdmin : admin
    );

    await localforage.setItem("admins", newAdmins);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...updatedAdminWithoutPassword } = updatedAdmin;

    return successResponse({
      data: updatedAdminWithoutPassword,
      message: "Successfully activated admin",
    });
  }),
];
