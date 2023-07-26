import {
  AdminSchema,
  Admin,
  AdminWithoutPasswordSchema,
} from "@/schemas/admin.schema";
import { LoginSchema, RegisterSchema } from "@/schemas/auth.schema";
import localforage from "localforage";
import { rest } from "msw";
import { nanoid } from "nanoid";
import { successResponse, errorResponse } from "../utils";

export const authHandlers = [
  rest.post("/api/login", async (req) => {
    const data = LoginSchema.parse(await req.json());
    const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const admin = storedAdmins.find(
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
    const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const isAdminExisted = storedAdmins.some(
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

    const newAdmins = [...storedAdmins, newAdmin];

    await localforage.setItem("admins", newAdmins);
    await localforage.setItem("logged_in_admin", newAdmin);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...newAdminWithoutPassword } = newAdmin;

    return successResponse({
      data: newAdminWithoutPassword,
      message: "Successfully registered admin",
    });
  }),
  rest.get("/api/me", async () => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const loggedInAdmin = AdminWithoutPasswordSchema.parse(
      unparsedLoggedInAdmin
    );

    return successResponse({
      data: loggedInAdmin,
      message: "Successfully retrieved current admin",
    });
  }),
];
