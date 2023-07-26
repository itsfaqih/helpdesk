import { AdminWithoutPasswordSchema } from "@/schemas/admin.schema";
import {
  BaseResponseError,
  ForbiddenError,
  UnauthorizedError,
} from "@/utils/error.util";
import localforage from "localforage";
import { response, context, ResponseTransformer } from "msw";

type BaseResponseParams = {
  message: string;
  status?: number;
  transformers?: ResponseTransformer[];
};

type SuccessResponseParams<TData> = BaseResponseParams & {
  data: TData;
  meta?: {
    pagination?: {
      current_page: number;
      per_page: number;
      from: number;
      to: number;
      total: number;
      last_page: number;
    };
  };
};

export function successResponse<TData>({
  data,
  message,
  meta,
  status = 200,
  transformers,
}: SuccessResponseParams<TData>) {
  return response(
    ...(transformers ?? []),
    context.json({
      data,
      message,
      meta,
    }),
    context.status(status),
    context.delay()
  );
}

export function errorResponse({
  message,
  status = 200,
  transformers,
}: BaseResponseParams) {
  return response(
    ...(transformers ?? []),
    context.json({
      data: null,
      message,
    }),
    context.status(status),
    context.delay()
  );
}

export async function allowAuthenticatedOnly() {
  const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

  if (!unparsedLoggedInAdmin) {
    throw new UnauthorizedError();
  }

  return unparsedLoggedInAdmin;
}

export async function allowSuperAdminOnly() {
  const unparsedLoggedInAdmin = await allowAuthenticatedOnly();

  const loggedInAdmin = AdminWithoutPasswordSchema.parse(unparsedLoggedInAdmin);

  if (loggedInAdmin.role !== "super_admin") {
    throw new ForbiddenError();
  }

  return loggedInAdmin;
}

export function handleResponseError(error: unknown) {
  if (error instanceof BaseResponseError) {
    return errorResponse({
      message: error.message,
      status: error.code,
    });
  }

  throw error;
}
