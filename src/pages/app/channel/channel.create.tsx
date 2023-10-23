import { AppPageTitle } from '../_components/page-title.app';
import { APIResponseSchema } from '@/schemas/api.schema';
import { ChannelSchema, CreateChannelSchema } from '@/schemas/channel.schema';
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
import { TextAreabox } from '@/components/derived/textareabox';
import { UnprocessableEntityError } from '@/utils/error.util';
import { SaveButton } from '@/components/derived/save-button';

function loader() {
  return async () => {
    return loaderResponse({
      pageTitle: 'Create Channel',
    });
  };
}

ChannelCreatePage.loader = loader;

export function ChannelCreatePage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const navigate = useNavigate();
  const createChannelForm = useForm<CreateChannelSchema>({
    resolver: zodResolver(CreateChannelSchema),
  });

  const createChannelMutation = useCreateChannelMutation();

  const onSubmit = createChannelForm.handleSubmit((data) => {
    createChannelMutation.mutate(data, {
      onSuccess(res) {
        navigate(`/channels/${res.data.id}`);
      },
    });
  });

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/channels" />
      <AppPageTitle title={loaderData.pageTitle} className="mt-4" />
      <Card className="px-4.5 py-5 mt-6 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form id="create-channel-form" onSubmit={onSubmit} className="flex flex-col gap-y-4">
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="name">Name</Label>
            <div className="col-span-3">
              <Textbox
                {...createChannelForm.register('name')}
                label="Name"
                placeholder="Enter Name"
                disabled={createChannelMutation.isLoading}
                error={createChannelForm.formState.errors.name?.message}
                srOnlyLabel
                data-testid="textbox-name"
              />
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="description">Description</Label>
            <div className="col-span-3">
              <TextAreabox
                {...createChannelForm.register('description')}
                label="Description"
                placeholder="Enter Description"
                disabled={createChannelMutation.isLoading}
                error={createChannelForm.formState.errors.description?.message}
                srOnlyLabel
                rows={3}
                data-testid="textbox-description"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <SaveButton
              type="submit"
              loading={createChannelMutation.isLoading}
              success={createChannelMutation.isSuccess}
              data-testid="btn-create-channel"
            />
          </div>
        </form>
      </Card>
    </AppPageContainer>
  );
}

const CreateChannelResponseSchema = APIResponseSchema({
  schema: ChannelSchema.pick({
    id: true,
    name: true,
  }),
});

function useCreateChannelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: CreateChannelSchema) {
      try {
        const res = await api.post(data, '/channels');

        return CreateChannelResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof UnprocessableEntityError) {
          throw new Error('Channel with this name already exists');
        }

        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['channel', 'index']);
    },
  });
}
