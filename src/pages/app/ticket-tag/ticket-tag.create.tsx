import { AppPageTitle } from '../_components/page-title.app';
import {
  CreateTicketTagSchema,
  TicketTagSchema,
  UpdateTicketTagSchema,
} from '@/schemas/ticket.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '@/libs/api.lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Textbox } from '@/components/derived/textbox';
import { Label } from '@/components/base/label';
import { Card } from '@/components/base/card';
import { TextAreabox } from '@/components/derived/textareabox';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageBackLink } from '../_components/page-back-link';
import { SaveButton } from '@/components/derived/save-button';

function loader() {
  return async () => {
    return loaderResponse({
      pageTitle: 'Create Ticket tag',
    });
  };
}

TicketTagCreatePage.loader = loader;

export function TicketTagCreatePage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const navigate = useNavigate();
  const createTicketTagForm = useForm<CreateTicketTagSchema>({
    resolver: zodResolver(CreateTicketTagSchema),
  });

  const createTicketTagMutation = useCreateTicketTagMutation();

  const onSubmit = createTicketTagForm.handleSubmit((data) => {
    createTicketTagMutation.mutate(data, {
      onSuccess(res) {
        navigate(`/ticket-tags/${res.data.id}`);
      },
    });
  });

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/ticket-tags" />
      <AppPageTitle title={loaderData.pageTitle} className="mt-4" />
      <Card className="px-4.5 py-5 mt-6 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form id="create-ticket-tag-form" onSubmit={onSubmit} className="flex flex-col gap-y-4">
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="name">Name</Label>
            <div className="col-span-3">
              <Textbox
                {...createTicketTagForm.register('name')}
                label="Name"
                placeholder="Enter name"
                disabled={createTicketTagMutation.isPending}
                error={createTicketTagForm.formState.errors.name?.message}
                noLabel
              />
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="description">Description</Label>
            <div className="col-span-3">
              <TextAreabox
                {...createTicketTagForm.register('description')}
                label="Description"
                placeholder="Enter description"
                disabled={createTicketTagMutation.isPending}
                error={createTicketTagForm.formState.errors.description?.message}
                noLabel
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <SaveButton
              form="create-ticket-tag-form"
              type="submit"
              loading={createTicketTagMutation.isPending}
              success={createTicketTagMutation.isSuccess && !createTicketTagForm.formState.isDirty}
            />
          </div>
        </form>
      </Card>
    </AppPageContainer>
  );
}

const CreateTicketTagResponseSchema = APIResponseSchema({
  schema: TicketTagSchema,
});

function useCreateTicketTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateTicketTagSchema) {
      try {
        const res = await api.post(data, '/ticket-tags');

        return CreateTicketTagResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['ticket-tag', 'index'] });
    },
  });
}
