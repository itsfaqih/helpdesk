import { AppPageTitle } from '../_components/page-title.app';
import { APIResponseSchema } from '@/schemas/api.schema';
import { ClientSchema, CreateClientSchema } from '@/schemas/client.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '@/libs/api.lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textbox } from '@/components/derived/textbox';
import { Label } from '@/components/base/label';
import { Card } from '@/components/base/card';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageBackLink } from '../_components/page-back-link';
import { UnprocessableEntityError } from '@/utils/error.util';
import { SaveButton } from '@/components/derived/save-button';

function loader() {
  return async () => {
    return loaderResponse({
      pageTitle: 'Create Client',
    });
  };
}

ClientCreatePage.loader = loader;

export function ClientCreatePage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const navigate = useNavigate();
  const createClientForm = useForm<CreateClientSchema>({
    resolver: zodResolver(CreateClientSchema),
  });

  const createClientMutation = useCreateClientMutation();

  const onSubmit = createClientForm.handleSubmit((data) => {
    createClientMutation.mutate(data, {
      onSuccess(res) {
        navigate(`/clients/${res.data.id}`);
      },
    });
  });

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/clients" />
      <AppPageTitle title={loaderData.pageTitle} className="mt-4" />
      <Card className="px-4.5 py-5 mt-6 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form id="create-client-form" onSubmit={onSubmit} className="flex flex-col gap-y-4">
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="full_name">Full Name</Label>
            <div className="col-span-3">
              <Textbox
                {...createClientForm.register('full_name')}
                label="Full Name"
                placeholder="Enter Full Name"
                disabled={createClientMutation.isPending}
                error={createClientForm.formState.errors.full_name?.message}
                srOnlyLabel
              />
            </div>
          </div>
          <div className="flex justify-end">
            <SaveButton
              type="submit"
              loading={createClientMutation.isPending}
              success={createClientMutation.isSuccess}
            />
          </div>
        </form>
      </Card>
    </AppPageContainer>
  );
}

const CreateClientResponseSchema = APIResponseSchema({
  schema: ClientSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

function useCreateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: CreateClientSchema) {
      try {
        const res = await api.post(data, '/clients');

        return CreateClientResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof UnprocessableEntityError) {
          throw new Error('Email is already registered');
        }

        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['client', 'index'] });
    },
  });
}
