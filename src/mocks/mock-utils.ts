import { UserWithoutPasswordSchema } from '@/schemas/user.schema';
import { BaseResponseError, ForbiddenError, UnauthorizedError } from '@/utils/error.util';
import { HttpResponse, HttpResponseInit } from 'msw';
import { z } from 'zod';
import { db } from './records/db';

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
  const loggedInUser = await db.users.where('id').equals(sessionId).first();

  if (!loggedInUser) {
    throw new UnauthorizedError();
  }

  return loggedInUser;
}

type AllowSuperUserOnlyParams = {
  sessionId: string | string[];
};

export async function allowSuperUserOnly({ sessionId }: AllowSuperUserOnlyParams) {
  const unparsedLoggedInUser = await allowAuthenticatedOnly({ sessionId });

  const loggedInUser = UserWithoutPasswordSchema.parse(unparsedLoggedInUser);

  if (loggedInUser.role !== 'super_admin') {
    throw new ForbiddenError();
  }

  return loggedInUser;
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
