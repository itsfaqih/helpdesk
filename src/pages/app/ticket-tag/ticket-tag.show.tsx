import * as React from 'react';
import { AppPageTitle } from '../_components/page-title.app';
import { TicketTag, TicketTagSchema, UpdateTicketTagSchema } from '@/schemas/ticket.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '@/libs/api.lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import {
  TicketTagShowRequestSchema,
  fetchTicketTagShowQuery,
  useTicketTagShowQuery,
} from '@/queries/ticket.query';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { Textbox } from '@/components/derived/textbox';
import { Label } from '@/components/base/label';
import { Card } from '@/components/base/card';
import { Skeleton } from '@/components/base/skeleton';
import { TextAreabox } from '@/components/derived/textareabox';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageBackLink } from '../_components/page-back-link';
import { RestoreTicketTagDialog } from './_components/restore-ticket-tag-dialog';
import { ArchiveTicketTagDialog } from './_components/archive-ticket-tag-dialog';
import { ArchiveButton } from '@/components/derived/archive-button';
import { SaveButton } from '@/components/derived/save-button';
import { RestoreButton } from '@/components/derived/restore-button';

function loader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const requestData = TicketTagShowRequestSchema.parse(params);

    await fetchTicketTagShowQuery({
      queryClient,
      request: requestData,
    }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Edit Ticket tag',
      data: { request: requestData },
    });
  };
}

TicketTagShowPage.loader = loader;

export function TicketTagShowPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const ticketTagShowQuery = useTicketTagShowQuery({
    id: loaderData.data.request.id,
  });
  const ticketTag = ticketTagShowQuery.data?.data;

  const updateTicketTagForm = useForm<UpdateTicketTagSchema>({
    resolver: zodResolver(UpdateTicketTagSchema),
    defaultValues: ticketTag,
  });

  const updateTicketTagMutation = useUpdateTicketTagMutation({
    ticketTagId: loaderData.data.request.id,
  });

  const onSubmit = updateTicketTagForm.handleSubmit((data) => {
    updateTicketTagMutation.mutate(data);
  });

  React.useEffect(() => {
    updateTicketTagForm.reset(ticketTag);
  }, [ticketTag, updateTicketTagForm]);

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/ticket-tags" />
      <div className="flex items-center mt-4">
        <AppPageTitle title={loaderData.pageTitle} />

        <div className="ml-auto">
          {ticketTag &&
            (ticketTag.is_archived ? (
              <RestoreTicketTagDialog
                ticketTagId={ticketTag.id}
                trigger={<RestoreButton type="button" data-testid="btn-restore-ticket-tag" />}
              />
            ) : (
              <ArchiveTicketTagDialog
                ticketTagId={ticketTag.id}
                trigger={<ArchiveButton type="button" data-testid="btn-archive-ticket-tag" />}
              />
            ))}
        </div>
      </div>
      <Card className="px-4.5 py-5 mt-6 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form id="update-ticket-tag-form" onSubmit={onSubmit} className="flex flex-col gap-y-4">
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="full_name">Name</Label>
            <div className="col-span-3">
              {ticketTagShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {ticketTagShowQuery.isSuccess && (
                <Textbox
                  label="Name"
                  placeholder="Name"
                  disabled={updateTicketTagMutation.isPending}
                  value={ticketTag?.name}
                  readOnly
                  srOnlyLabel
                  data-testid="textbox-name"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="description">Description</Label>
            <div className="col-span-3">
              {ticketTagShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {ticketTagShowQuery.isSuccess && (
                <TextAreabox
                  {...updateTicketTagForm.register('description')}
                  label="Description"
                  placeholder={ticketTag?.is_archived ? 'No description' : 'Enter Description'}
                  disabled={updateTicketTagMutation.isPending}
                  error={updateTicketTagForm.formState.errors.description?.message}
                  readOnly={ticketTag?.is_archived}
                  srOnlyLabel
                  rows={3}
                  data-testid="textbox-description"
                />
              )}
            </div>
          </div>
          {!ticketTag?.is_archived && (
            <div className="flex justify-end">
              <SaveButton
                form="update-ticket-tag-form"
                type="submit"
                loading={updateTicketTagMutation.isPending}
                success={
                  updateTicketTagMutation.isSuccess && !updateTicketTagForm.formState.isDirty
                }
                data-testid="btn-update-ticket-tag"
              />
            </div>
          )}
        </form>
      </Card>
    </AppPageContainer>
  );
}

const UpdateTicketTagResponseSchema = APIResponseSchema({
  schema: TicketTagSchema,
});

type UseUpdateTicketTagMutationParams = {
  ticketTagId: TicketTag['id'];
};

function useUpdateTicketTagMutation({ ticketTagId }: UseUpdateTicketTagMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateTicketTagSchema) {
      try {
        const res = await api.put(data, `/ticket-tags/${ticketTagId}`);

        return UpdateTicketTagResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['ticket-tag', 'index'] });
      await queryClient.invalidateQueries({
        queryKey: ['ticket-tag', 'show', ticketTagId],
      });
    },
  });
}
