import { BaseAPIResponseSchema } from "@/schemas/api.schema";
import {
  BadRequestError,
  BadResponseError,
  ConflictError,
  FetchError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/error.util";
import wretch from "wretch";

export const api = wretch(`${import.meta.env.VITE_API_URL}/api`).resolve(
  async (r) => {
    return await r
      .notFound(() => {
        throw new NotFoundError();
      })
      .fetchError(() => {
        throw new FetchError();
      })
      .forbidden(() => {
        throw new ForbiddenError();
      })
      .unauthorized(() => {
        throw new UnauthorizedError();
      })
      .badRequest(() => {
        throw new BadRequestError();
      })
      .internalError(() => {
        throw new InternalServerError();
      })
      .error(409, () => {
        throw new ConflictError();
      })
      .json(async (json) => {
        return await BaseAPIResponseSchema.parseAsync(json).catch(() => {
          throw new BadResponseError();
        });
      });
  }
);
