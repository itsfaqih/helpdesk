import { AppPageTitle } from '../_components/page-title.app';
import { Client, ClientSchema, UpdateClientSchema } from '@/schemas/client.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '@/libs/api.lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import {
  ClientShowRequestSchema,
  fetchClientShowQuery,
  useClientShowQuery,
} from '@/queries/client.query';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { Textbox } from '@/components/derived/textbox';
import { Label } from '@/components/base/label';
import { Card } from '@/components/base/card';
import { Skeleton } from '@/components/base/skeleton';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageBackLink } from '../_components/page-back-link';
import { RestoreClientDialog } from './_components/restore-client-dialog';
import { ArchiveClientDialog } from './_components/archive-client-dialog';
import { SaveButton } from '@/components/derived/save-button';
import { ArchiveButton } from '@/components/derived/archive-button';
import { toast } from '@/components/base/toast';
import { RestoreButton } from '@/components/derived/restore-button';

function loader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const requestData = ClientShowRequestSchema.parse(params);

    await fetchClientShowQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Edit Client',
      data: { request: requestData },
    });
  };
}

ClientShowPage.loader = loader;

export function ClientShowPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const clientShowQuery = useClientShowQuery({
    id: loaderData.data.request.id,
  });
  const client = clientShowQuery.data?.data;

  const updateClientForm = useForm<UpdateClientSchema>({
    resolver: zodResolver(UpdateClientSchema),
    values: client,
  });

  const updateClientMutation = useUpdateClientMutation({
    clientId: loaderData.data.request.id,
  });

  const onSubmit = updateClientForm.handleSubmit((data) => {
    updateClientMutation.mutate(data);
  });

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/clients" />
      <div className="flex items-center mt-4">
        <AppPageTitle title={loaderData.pageTitle} />

        <div className="ml-auto">
          {client &&
            (client.is_archived ? (
              <RestoreClientDialog
                clientId={client.id}
                clientFullName={client.full_name}
                trigger={<RestoreButton type="button" />}
              />
            ) : (
              <ArchiveClientDialog
                clientId={client.id}
                clientFullName={client.full_name}
                trigger={<ArchiveButton type="button" />}
              />
            ))}
        </div>
      </div>
      <Card className="px-4.5 py-5 mt-6 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form id="update-client-form" onSubmit={onSubmit} className="flex flex-col gap-y-4">
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="full_name">Full Name</Label>
            <div className="col-span-3">
              {clientShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {clientShowQuery.isSuccess && (
                <Textbox
                  {...updateClientForm.register('full_name')}
                  label="Full Name"
                  placeholder="Enter Full Name"
                  disabled={updateClientMutation.isPending}
                  error={updateClientForm.formState.errors.full_name?.message}
                  readOnly={client?.is_archived}
                  noLabel
                />
              )}
            </div>
          </div>
          {!client?.is_archived && (
            <div className="flex justify-end">
              <SaveButton
                form="update-client-form"
                type="submit"
                loading={updateClientMutation.isPending}
                success={updateClientMutation.isSuccess && !updateClientForm.formState.isDirty}
              />
            </div>
          )}
        </form>
      </Card>
    </AppPageContainer>
  );
}

const UpdateClientResponseSchema = APIResponseSchema({
  schema: ClientSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

type UseUpdateClientMutationParams = {
  clientId: Client['id'];
};

function useUpdateClientMutation({ clientId }: UseUpdateClientMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateClientSchema) {
      try {
        const res = await api.put(data, `/clients/${clientId}`);

        return UpdateClientResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      toast.create({
        title: 'Client updated successfully',
        type: 'success',
      });

      await queryClient.invalidateQueries({ queryKey: ['client', 'index'] });
    },
  });
}
