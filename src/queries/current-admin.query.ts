import { api } from "@/libs/api.lib";
import { useLogOutMutation } from "@/mutations/log-out.mutation";
import { AdminWithoutPasswordSchema } from "@/schemas/admin.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import { useQuery } from "@tanstack/react-query";

const CurrentAdminResponseSchema = APIResponseSchema({
  schema: AdminWithoutPasswordSchema,
});

export function useCurrentAdminQuery() {
  const logOutMutation = useLogOutMutation();

  return useQuery({
    queryKey: ["current_admin"],
    async queryFn() {
      try {
        const res = await api.get("me").json();

        return CurrentAdminResponseSchema.parse(res);
      } catch (error) {
        logOutMutation.mutate();

        throw error;
      }
    },
  });
}
