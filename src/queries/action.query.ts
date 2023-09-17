import { api } from "@/libs/api.lib";
import { APIResponseSchema } from "@/schemas/api.schema";
import { ActionSchema } from "@/schemas/action.schema";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import qs from "qs";

export const ActionIndexRequestSchema = z.object({
  search: z.string().optional().catch(undefined),
  is_archived: z.enum(["1", "0"]).optional().catch(undefined),
  page: z.coerce.number().optional().catch(undefined),
});

export type ActionIndexRequest = z.infer<typeof ActionIndexRequestSchema>;

const ActionIndexResponseSchema = APIResponseSchema({
  schema: ActionSchema.array(),
});

export function actionIndexQuery(request: ActionIndexRequest = {}) {
  return {
    queryKey: ["action", "index", request],
    async queryFn() {
      const queryStrings = qs.stringify(request);
      const res = await api.get(`/actions?${queryStrings}`);

      return ActionIndexResponseSchema.parse(res);
    },
  };
}

export function useChannelTicketResponseIndexQuery(
  request: ActionIndexRequest = {}
) {
  return useQuery(actionIndexQuery(request));
}
