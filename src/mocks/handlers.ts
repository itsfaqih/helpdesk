import { LoginSchema, RegisterSchema } from "@/schemas/auth.schema";
import { UserSchema, UserWithoutPasswordSchema } from "@/schemas/user.schema";
import localforage from "localforage";
import { rest } from "msw";
import { errorResponse, successResponse } from "./res";
import { nanoid } from "nanoid";

export const handlers = [
  rest.post("/api/login", async (req) => {
    const data = LoginSchema.parse(await req.json());
    const unparsedCurrentUsers = (await localforage.getItem("users")) ?? [];
    const currentUsers = UserSchema.array().parse(unparsedCurrentUsers);

    const user = currentUsers.find(
      (user) => user.email === data.email && user.password === data.password
    );

    if (user) {
      return successResponse({
        data: user,
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
    const unparsedCurrentUsers = (await localforage.getItem("users")) ?? [];
    const currentUsers = UserSchema.array().parse(unparsedCurrentUsers);

    const isUserExisted = currentUsers.some(
      (user) => user.email === data.email
    );

    if (isUserExisted) {
      return errorResponse({
        message: "Email is already registered",
        status: 409,
      });
    }

    const newUser = {
      id: nanoid(),
      full_name: data.full_name,
      email: data.email,
      password: data.password,
    };

    const newUsers = [...currentUsers, newUser];

    await localforage.setItem("users", newUsers);
    await localforage.setItem("current_user", newUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...newUserWithoutPassword } = newUser;

    return successResponse({
      data: newUserWithoutPassword,
      message: "Successfully registered user",
    });
  }),
  rest.get("/api/me", async () => {
    const currentUser = await localforage.getItem("current_user");

    if (!currentUser) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const parsedCurrentUser = UserWithoutPasswordSchema.parse(currentUser);

    return successResponse({
      data: parsedCurrentUser,
      message: "Successfully retrieved current user",
    });
  }),
];
