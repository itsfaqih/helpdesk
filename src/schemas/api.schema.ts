import { z } from "zod";

type APIResponseSchemaParams<TSchema extends z.ZodTypeAny> = {
  schema: TSchema;
};

export function APIResponseSchema<TSchema extends z.ZodTypeAny>({
  schema,
}: APIResponseSchemaParams<TSchema>) {
  return z.object({
    message: z.string(),
    data: schema,
  });
}
