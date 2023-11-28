import { api } from '@/libs/api.lib';
import { useLogOutMutation } from '@/mutations/log-out.mutation';
import { UserWithoutPasswordSchema } from '@/schemas/user.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { UserError } from '@/utils/error.util';
import { QueryClient, useQuery } from '@tanstack/react-query';

const LoggedInUserResponseSchema = APIResponseSchema({
  schema: UserWithoutPasswordSchema,
});

export function loggedInUserQuery() {
  return {
    queryKey: ['logged_in_user'],
    async queryFn() {
      const res = await api.get('/me');

      return LoggedInUserResponseSchema.parse(res);
    },
  };
}

export function useLoggedInUserQuery() {
  const logOutMutation = useLogOutMutation();

  return useQuery({
    queryKey: loggedInUserQuery().queryKey,
    async queryFn() {
      try {
        const res = await api.get('/me');

        return LoggedInUserResponseSchema.parse(res);
      } catch (error) {
        logOutMutation.mutate();

        throw error;
      }
    },
  });
}

type FetchUserShowQueryParams = {
  queryClient: QueryClient;
};

export async function fetchLoggedInUserQuery({ queryClient }: FetchUserShowQueryParams) {
  const loggedInUserQueryOpt = loggedInUserQuery();

  queryClient.getQueryData(loggedInUserQueryOpt.queryKey) ??
    (await queryClient.fetchQuery(loggedInUserQueryOpt).catch((error) => {
      if (error instanceof UserError) {
        throw error;
      }
    }));
}
