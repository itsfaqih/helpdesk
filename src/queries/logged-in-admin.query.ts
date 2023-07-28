import { api } from "@/libs/api.lib";
import { useLogOutMutation } from "@/mutations/log-out.mutation";
import { AdminWithoutPasswordSchema } from "@/schemas/admin.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import { useQuery } from "@tanstack/react-query";

const LoggedInAdminResponseSchema = APIResponseSchema({
  schema: AdminWithoutPasswordSchema,
});

export function loggedInAdminQuery() {
  return {
    queryKey: ["logged_in_admin"],
    async queryFn() {
      const res = await api.get("/me");

      return LoggedInAdminResponseSchema.parse(res);
    },
  };
}

export function useLoggedInAdminQuery() {
  const logOutMutation = useLogOutMutation();

  return useQuery({
    queryKey: loggedInAdminQuery().queryKey,
    async queryFn() {
      try {
        const res = await api.get("/me");

        return LoggedInAdminResponseSchema.parse(res);
      } catch (error) {
        logOutMutation.mutate();

        throw error;
      }
    },
  });
}
