import { api } from '@/libs/api.lib';
import { useLogOutMutation } from '@/mutations/log-out.mutation';
import { AdminWithoutPasswordSchema } from '@/schemas/admin.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { UserError } from '@/utils/error.util';
import { QueryClient, useQuery } from '@tanstack/react-query';

const LoggedInAdminResponseSchema = APIResponseSchema({
  schema: AdminWithoutPasswordSchema,
});

export function loggedInAdminQuery() {
  return {
    queryKey: ['logged_in_admin'],
    async queryFn() {
      const res = await api.get('/me');

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
        const res = await api.get('/me');

        return LoggedInAdminResponseSchema.parse(res);
      } catch (error) {
        logOutMutation.mutate();

        throw error;
      }
    },
  });
}

type FetchAdminShowQueryParams = {
  queryClient: QueryClient;
};

export async function fetchLoggedInAdminQuery({ queryClient }: FetchAdminShowQueryParams) {
  const loggedInAdminQueryOpt = loggedInAdminQuery();

  queryClient.getQueryData(loggedInAdminQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(loggedInAdminQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}
