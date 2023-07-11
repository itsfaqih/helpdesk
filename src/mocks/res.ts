import { response, context, ResponseTransformer } from "msw";

type BaseResponseParams = {
  message: string;
  status?: number;
  transformers?: ResponseTransformer[];
};

type SuccessResponseParams<TData> = BaseResponseParams & {
  data: TData;
};

export function successResponse<TData>({
  data,
  message,
  status = 200,
  transformers,
}: SuccessResponseParams<TData>) {
  return response(
    ...(transformers ?? []),
    context.json({
      data,
      message,
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
