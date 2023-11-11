import { AdminSchema, AdminWithoutPasswordSchema } from '@/schemas/admin.schema';
import { BaseResponseError, ForbiddenError, UnauthorizedError } from '@/utils/error.util';
import localforage from 'localforage';
import { HttpResponse, HttpResponseInit } from 'msw';
import { z } from 'zod';

type BaseResponseParams<TData = unknown> = {
  data?: TData;
  message: string;
  status?: number;
  httpResponseInit?: HttpResponseInit;
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
  httpResponseInit,
}: SuccessResponseParams<TData>) {
  return HttpResponse.json(
    { data, message, meta },
    {
      ...httpResponseInit,
      status,
    },
  );
}

export function errorResponse({
  data = null,
  message,
  status = 200,
  httpResponseInit,
}: BaseResponseParams) {
  return HttpResponse.json(
    {
      data,
      message,
    },
    {
      ...httpResponseInit,
      status,
    },
  );
}

type AllowAuthenticatedOnlyParams = {
  sessionId: string | string[];
};

export async function allowAuthenticatedOnly({ sessionId }: AllowAuthenticatedOnlyParams) {
  const unparsedStoredAdmins = (await localforage.getItem('admins')) ?? [];
  const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

  const loggedInAdmin = storedAdmins.find((admin) => admin.id === sessionId);

  if (!loggedInAdmin) {
    throw new UnauthorizedError();
  }

  return loggedInAdmin;
}

type AllowSuperAdminOnlyParams = {
  sessionId: string | string[];
};

export async function allowSuperAdminOnly({ sessionId }: AllowSuperAdminOnlyParams) {
  const unparsedLoggedInAdmin = await allowAuthenticatedOnly({ sessionId });

  const loggedInAdmin = AdminWithoutPasswordSchema.parse(unparsedLoggedInAdmin);

  if (loggedInAdmin.role !== 'super_admin') {
    throw new ForbiddenError();
  }

  return loggedInAdmin;
}

export function handleResponseError(error: unknown) {
  if (error instanceof z.ZodError) {
    return errorResponse({
      data: error.errors,
      message: 'Invalid payload data',
      status: 400,
    });
  }
  if (error instanceof BaseResponseError) {
    return errorResponse({
      message: error.message,
      status: error.code,
    });
  }

  throw error;
}
