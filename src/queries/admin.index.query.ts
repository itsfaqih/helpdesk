import { api } from "@/libs/api.lib";
import { AdminWithoutPasswordSchema } from "@/schemas/admin.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

export const AdminIndexRequestSchema = z
  .object({
    search: z.string(),
    role: z.enum(["super_admin", "operator"]),
    is_active: z.enum(["1", "0"]),
  })
  .partial();

type AdminIndexRequest = z.infer<typeof AdminIndexRequestSchema>;

const AdminIndexResponseSchema = APIResponseSchema({
  schema: AdminWithoutPasswordSchema.array(),
});

export function useAdminIndexQuery(request: AdminIndexRequest = {}) {
  return useQuery({
    queryKey: ["admin", "index", request],
    async queryFn() {
      const qs = new URLSearchParams(request).toString();
      const res = await api.get(`admins?${qs}`).json();

      return AdminIndexResponseSchema.parse(res);
    },
  });
}
