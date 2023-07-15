import { z } from "zod";

export const BaseAPIResponseSchema = z.object({
  message: z.string(),
  data: z.unknown(),
  meta: z
    .object({
      pagination: z
        .object({
          current_page: z.number().int(),
          per_page: z.number().int(),
          from: z.number().int(),
          to: z.number().int(),
          total: z.number().int(),
          last_page: z.number().int(),
        })
        .optional(),
    })
    .optional(),
});

type APIResponseSchemaParams<TSchema extends z.ZodTypeAny> = {
  schema: TSchema;
};

export function APIResponseSchema<TSchema extends z.ZodTypeAny>({
  schema,
}: APIResponseSchemaParams<TSchema>) {
  return BaseAPIResponseSchema.extend({
    data: schema,
  });
}
