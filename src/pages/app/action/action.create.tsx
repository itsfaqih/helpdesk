import { AppPageTitle } from '../_components/page-title.app';
import { APIResponseSchema } from '@/schemas/api.schema';
import { ActionSchema, CreateActionSchema } from '@/schemas/action.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { UnprocessableEntityError } from '@/utils/error.util';
import { api } from '@/libs/api.lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textbox } from '@/components/derived/textbox';
import { Label } from '@/components/base/label';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageBackLink } from '../_components/page-back-link';
import { TextAreabox } from '@/components/derived/textareabox';
import { IconPicker } from '@/components/derived/icon-picker';
import { SaveButton } from '@/components/derived/save-button';
import { PageSectionTitle } from '../_components/page-section-title';
import { PageFormCard } from '../_components/page-form-card';

function loader() {
  return async () => {
    return loaderResponse({
      pageTitle: 'Create Action',
    });
  };
}

ActionCreatePage.loader = loader;

export function ActionCreatePage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const navigate = useNavigate();
  const createActionForm = useForm<CreateActionSchema>({
    resolver: zodResolver(CreateActionSchema),
    defaultValues: {
      icon_type: 'emoji',
    },
  });

  const createActionMutation = useCreateActionMutation();

  const onSubmit = createActionForm.handleSubmit((data) => {
    createActionMutation.mutate(data, {
      onSuccess(res) {
        navigate(`/actions/${res.data.id}`);
      },
    });
  });

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/actions" />
      <AppPageTitle title={loaderData.pageTitle} className="mt-4" />
      <section className="mt-6">
        <PageSectionTitle>General Information</PageSectionTitle>
        <PageFormCard className="mt-4">
          <form id="create-action-form" onSubmit={onSubmit} className="flex flex-col gap-y-4">
            <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
              <Label htmlFor="icon_picker">Icon</Label>
              <div className="col-span-3 flex">
                <Controller
                  control={createActionForm.control}
                  name="icon_value"
                  render={({ field }) => (
                    <IconPicker
                      id="icon_picker"
                      value={{ emojiId: field.value }}
                      onChange={({ emojiId }) => field.onChange(emojiId)}
                    />
                  )}
                />
              </div>
            </div>
            <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
              <Label htmlFor="label">Label</Label>
              <div className="col-span-3">
                <Textbox
                  {...createActionForm.register('label')}
                  label="Label"
                  placeholder="Enter Label"
                  disabled={createActionMutation.isPending}
                  error={createActionForm.formState.errors.label?.message}
                  srOnlyLabel
                  data-testid="textbox-label"
                />
              </div>
            </div>
            <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
              <Label htmlFor="description">Description</Label>
              <div className="col-span-3">
                <TextAreabox
                  {...createActionForm.register('description')}
                  label="Description"
                  placeholder="Enter Description"
                  disabled={createActionMutation.isPending}
                  error={createActionForm.formState.errors.description?.message}
                  srOnlyLabel
                  rows={3}
                  data-testid="textbox-description"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <SaveButton
                type="submit"
                loading={createActionMutation.isPending}
                success={createActionMutation.isSuccess}
                data-testid="btn-create-action"
              />
            </div>
          </form>
        </PageFormCard>
      </section>
    </AppPageContainer>
  );
}

const CreateActionResponseSchema = APIResponseSchema({
  schema: ActionSchema,
});

function useCreateActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: CreateActionSchema) {
      try {
        const res = await api.post(data, '/actions');

        return CreateActionResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof UnprocessableEntityError) {
          throw new Error('Action with this name already exists');
        }

        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['action', 'index'] });
    },
  });
}
