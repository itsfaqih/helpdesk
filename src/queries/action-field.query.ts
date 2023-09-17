import { api } from "@/libs/api.lib";
import { APIResponseSchema } from "@/schemas/api.schema";
import { ActionFieldSchema, ActionSchema } from "@/schemas/action.schema";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

export const ActionFieldIndexRequestSchema = z.object({
  actionId: ActionSchema.shape.id,
});

export type ActionFieldIndexRequest = z.infer<
  typeof ActionFieldIndexRequestSchema
>;

const ActionFieldIndexResponseSchema = APIResponseSchema({
  schema: ActionFieldSchema.array(),
});

export function actionFieldIndexQuery(request: ActionFieldIndexRequest) {
  return {
    queryKey: ["action", "index", request],
    async queryFn() {
      const res = await api.get(
        `/actions/${request.actionId}/fields`
      );

      return ActionFieldIndexResponseSchema.parse(res);
    },
    enabled: !!request.actionId,
  };
}

export function useChannelTicketResponseFieldIndexQuery(
  request: ActionFieldIndexRequest
) {
  return useQuery(actionFieldIndexQuery(request));
}
