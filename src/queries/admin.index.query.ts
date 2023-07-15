import { api } from "@/libs/api.lib";
import { AdminWithoutPasswordSchema } from "@/schemas/admin.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import { UserError } from "@/utils/error.util";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";

export const AdminIndexRequestSchema = z.object({
  search: z.string().optional().catch(undefined),
  role: z.enum(["", "super_admin", "operator"]).optional().catch(undefined),
  is_active: z.enum(["1", "0"]).optional().catch(undefined),
});

export type AdminIndexRequest = z.infer<typeof AdminIndexRequestSchema>;

const AdminIndexResponseSchema = APIResponseSchema({
  schema: AdminWithoutPasswordSchema.array(),
});

export function adminIndexQuery(request: AdminIndexRequest = {}) {
  return {
    queryKey: ["admin", "index", request],
    async queryFn() {
      const qs = new URLSearchParams(request).toString();
      const res = await api.get(`/admins?${qs}`);

      return AdminIndexResponseSchema.parse(res);
    },
  };
}

export function useAdminIndexQuery(request: AdminIndexRequest = {}) {
  return useQuery(adminIndexQuery(request));
}

type FetchAdminIndexQueryParams = {
  queryClient: QueryClient;
  request?: AdminIndexRequest;
};

export async function fetchAdminIndexQuery({
  queryClient,
  request = {},
}: FetchAdminIndexQueryParams) {
  const adminIndexQueryOpt = adminIndexQuery(request);

  queryClient.getQueryData(adminIndexQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(adminIndexQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}
