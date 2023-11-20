import * as React from 'react';
import { AppPageTitle } from '../_components/page-title.app';
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import {
  ChannelShowRequestSchema,
  fetchChannelShowQuery,
  useChannelShowQuery,
} from '@/queries/channel.query';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { Textbox } from '@/components/derived/textbox';
import { Label } from '@/components/base/label';
import { Card } from '@/components/base/card';
import { Skeleton } from '@/components/base/skeleton';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { ArchiveChannelDialog } from './_components/archive-channel-dialog';
import { RestoreChannelDialog } from './_components/restore-channel-dialog';
import { AppPageBackLink } from '../_components/page-back-link';
import { TextAreabox } from '@/components/derived/textareabox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Channel,
  ChannelSchema,
  UpdateChannelFormSchema,
  UpdateChannelSchema,
} from '@/schemas/channel.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { api } from '@/libs/api.lib';
import { ArchiveButton } from '@/components/derived/archive-button';
import { toast } from '@/components/base/toast';
import { SaveButton } from '@/components/derived/save-button';
import { RestoreButton } from '@/components/derived/restore-button';

function loader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const requestData = ChannelShowRequestSchema.parse(params);

    await fetchChannelShowQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Edit Channel',
      data: { request: requestData },
    });
  };
}

ChannelShowPage.loader = loader;

export function ChannelShowPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const channelShowQuery = useChannelShowQuery({
    id: loaderData.data.request.id,
  });
  const channel = channelShowQuery.data?.data;

  const updateChannelForm = useForm<UpdateChannelFormSchema>({
    resolver: zodResolver(UpdateChannelFormSchema),
    defaultValues: channel,
  });

  const updateChannelMutation = useUpdateChannelMutation({
    channelId: loaderData.data.request.id,
  });

  const onSubmit = updateChannelForm.handleSubmit((data) => {
    updateChannelMutation.mutate(data);
  });

  React.useEffect(() => {
    updateChannelForm.reset(channel);
  }, [channel, updateChannelForm]);

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/channels" />
      <div className="flex items-center mt-4">
        <AppPageTitle title={loaderData.pageTitle} />

        <div className="ml-auto">
          {channel &&
            (channel.is_archived ? (
              <RestoreChannelDialog
                channelId={channel.id}
                channelName={channel.name}
                trigger={<RestoreButton type="button" />}
              />
            ) : (
              <ArchiveChannelDialog
                channelId={channel.id}
                channelName={channel.name}
                trigger={<ArchiveButton type="button" />}
              />
            ))}
        </div>
      </div>
      <Card className="px-4.5 py-5 mt-6 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form id="update-channel-form" onSubmit={onSubmit} className="flex flex-col gap-y-4">
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="name">Name</Label>
            <div className="col-span-3">
              {channelShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {channelShowQuery.isSuccess && (
                <Textbox
                  name="Name"
                  label="Name"
                  placeholder="Enter Name"
                  value={channel?.name}
                  readOnly
                  srOnlyLabel
                />
              )}
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="description">Description</Label>
            <div className="col-span-3">
              {channelShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {channelShowQuery.isSuccess && (
                <TextAreabox
                  {...updateChannelForm.register('description')}
                  label="Description"
                  placeholder="Enter Description"
                  srOnlyLabel
                  rows={3}
                />
              )}
            </div>
          </div>

          {!channel?.is_archived && (
            <div className="flex justify-end">
              <SaveButton
                form="update-channel-form"
                type="submit"
                loading={updateChannelMutation.isPending}
                success={updateChannelMutation.isSuccess && !updateChannelForm.formState.isDirty}
              />
            </div>
          )}
        </form>
      </Card>
    </AppPageContainer>
  );
}

const UpdateChannelResponseSchema = APIResponseSchema({
  schema: ChannelSchema,
});

type UseUpdateChannelMutationParams = {
  channelId: Channel['id'];
};

function useUpdateChannelMutation({ channelId }: UseUpdateChannelMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateChannelSchema) {
      try {
        const res = await api.put(data, `/channels/${channelId}`);

        return UpdateChannelResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      toast.create({
        title: 'Channel updated successfully',
        type: 'success',
      });

      await queryClient.invalidateQueries({ queryKey: ['channel', 'index'] });
      await queryClient.invalidateQueries({ queryKey: ['channel', 'show', channelId] });
    },
    async onError() {
      toast.create({
        title: 'Failed to update channel',
        type: 'error',
      });
    },
  });
}
