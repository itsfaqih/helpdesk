import * as React from 'react';
import { AppPageTitle } from '../_components/page-title.app';
import { APIResponseSchema } from '@/schemas/api.schema';
import { Action, ActionSchema, UpdateActionSchema } from '@/schemas/action.schema';
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { UnprocessableEntityError } from '@/utils/error.util';
import { api } from '@/libs/api.lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textbox } from '@/components/derived/textbox';
import { Label } from '@/components/base/label';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageBackLink } from '../_components/page-back-link';
import { TextAreabox } from '@/components/derived/textareabox';
import { IconPicker } from '@/components/derived/icon-picker';
import { SaveButton } from '@/components/derived/save-button';
import {
  ActionShowRequestSchema,
  fetchActionShowQuery,
  useActionShowQuery,
} from '@/queries/action.query';
import { ArchiveActionDialog } from './_components/archive-action-dialog';
import { RestoreActionDialog } from './_components/restore-action-dialog';
import { ArchiveButton } from '@/components/derived/archive-button';
import { RestoreButton } from '@/components/derived/restore-button';
import { DisableActionButton } from './_components/disable-action-button';
import { EnableActionButton } from './_components/enable-action-button';
import { Button, IconButton } from '@/components/base/button';
import { ArrowsClockwise, CaretDown, DotsSixVertical, Plus } from '@phosphor-icons/react';
import { cn } from '@/libs/cn.lib';
import { DisabledBadge } from './_components/disabled-badge';
import { EnabledBadge } from './_components/enabled-badge';
import { PageSectionTitle } from '../_components/page-section-title';
import { PageFormCard } from '../_components/page-form-card';
import {
  Select,
  SelectContent,
  SelectLabel,
  SelectOption,
  SelectTrigger,
} from '@/components/base/select';
import {
  ActionField,
  ActionFieldTypeEnum,
  UpdateActionFieldForm,
  UpdateActionFieldFormSchema,
  actionFieldTypeOptions,
} from '@/schemas/action-field.schema';
import { Checkbox } from '@/components/derived/checkbox';

function loader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const requestData = ActionShowRequestSchema.parse(params);

    await fetchActionShowQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Edit Action',
      data: { request: requestData },
    });
  };
}

ActionShowPage.loader = loader;

export function ActionShowPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const actionShowQuery = useActionShowQuery({
    id: loaderData.data.request.id,
  });
  const action = actionShowQuery.data?.data;

  const updateActionForm = useForm<UpdateActionSchema>({
    resolver: zodResolver(UpdateActionSchema),
    defaultValues: action,
  });

  const updateActionMutation = useUpdateActionMutation({
    actionId: loaderData.data.request.id,
  });

  const onSubmit = updateActionForm.handleSubmit((data) => {
    updateActionMutation.mutate(data);
  });

  React.useEffect(() => {
    updateActionForm.reset(action);
  }, [action, updateActionForm]);

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/actions" />
      <div className="flex justify-between items-center mt-4">
        <AppPageTitle title={loaderData.pageTitle} />
        <div className="flex gap-2">
          {action &&
            (action.is_archived ? (
              <RestoreActionDialog actionId={action.id} trigger={<RestoreButton type="button" />} />
            ) : (
              <ArchiveActionDialog
                actionId={action.id}
                trigger={<ArchiveButton type="button" data-testid="btn-archive-channel" />}
              />
            ))}
        </div>
      </div>
      <section className="mt-6">
        <PageSectionTitle>General Information</PageSectionTitle>
        <PageFormCard className="mt-4">
          <form id="create-action-form" onSubmit={onSubmit} className="flex flex-col gap-y-4">
            <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
              <Label htmlFor="icon_picker">Icon</Label>
              <div className="col-span-3 flex">
                <Controller
                  control={updateActionForm.control}
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
                  {...updateActionForm.register('label')}
                  label="Label"
                  placeholder="Enter Label"
                  disabled={updateActionMutation.isLoading}
                  error={updateActionForm.formState.errors.label?.message}
                  srOnlyLabel
                  data-testid="textbox-label"
                />
              </div>
            </div>
            <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
              <Label htmlFor="description">Description</Label>
              <div className="col-span-3">
                <TextAreabox
                  {...updateActionForm.register('description')}
                  label="Description"
                  placeholder="Enter Description"
                  disabled={updateActionMutation.isLoading}
                  error={updateActionForm.formState.errors.description?.message}
                  srOnlyLabel
                  rows={3}
                  data-testid="textbox-description"
                />
              </div>
            </div>
            <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
              <Label htmlFor="status">Status</Label>
              <div className="col-span-3">
                {action && (
                  <div className="flex items-center gap-2">
                    {action.is_disabled ? (
                      <>
                        <DisabledBadge />
                        <EnableActionButton actionId={action.id} asChild>
                          <IconButton
                            type="button"
                            label="Disable"
                            icon={({ className, ...props }) => (
                              <ArrowsClockwise
                                className={cn(
                                  className,
                                  'transition-transform',
                                  'group-data-[loading=false]:group-hover:rotate-90',
                                  'group-data-[loading=true]:animate-spin',
                                )}
                                {...props}
                              />
                            )}
                            className="group"
                          />
                        </EnableActionButton>
                      </>
                    ) : (
                      <>
                        <EnabledBadge />
                        <DisableActionButton actionId={action.id} asChild>
                          <IconButton
                            type="button"
                            label="Enable"
                            icon={({ className, ...props }) => (
                              <ArrowsClockwise
                                className={cn(
                                  className,
                                  'transition-transform',
                                  'group-data-[loading=false]:group-hover:rotate-90',
                                  'group-data-[loading=true]:animate-spin',
                                )}
                                {...props}
                              />
                            )}
                            className="group"
                          />
                        </DisableActionButton>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <SaveButton
                type="submit"
                loading={updateActionMutation.isLoading}
                success={updateActionMutation.isSuccess && !updateActionForm.formState.isDirty}
                data-testid="btn-update-action"
              />
            </div>
          </form>
        </PageFormCard>
      </section>
      {action && <ActionFieldFormSection actionId={loaderData.data.request.id} className="mt-8" />}
    </AppPageContainer>
  );
}

const UpdateActionResponseSchema = APIResponseSchema({
  schema: ActionSchema,
});

type UseUpdateActionMutationParams = {
  actionId: Action['id'];
};

function useUpdateActionMutation({ actionId }: UseUpdateActionMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateActionSchema) {
      try {
        const res = await api.put(data, `/actions/${actionId}`);

        return UpdateActionResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof UnprocessableEntityError) {
          throw new Error('Action with this label already exists');
        }

        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['action', 'index']);
      await queryClient.invalidateQueries(['action', 'show', actionId]);
    },
  });
}

function ActionFieldFormSection({
  actionId,
  className,
}: {
  actionId: Action['id'];
  className?: string;
}) {
  const actionShowQuery = useActionShowQuery({ id: actionId });
  const action = actionShowQuery.data?.data;

  return (
    <section className={className}>
      <div className="flex items-center justify-between">
        <PageSectionTitle>Fields</PageSectionTitle>
        <Button variant="plain" leading={(props) => <Plus {...props} />}>
          Add Field
        </Button>
      </div>
      <PageFormCard className="mt-4">
        {actionShowQuery.isLoading && <>Loading...</>}
        {actionShowQuery.isSuccess && (
          <div className="w-full grid gap-4">
            {action?.fields.map((field) => <ActionFieldItem key={field.id} actionField={field} />)}
          </div>
        )}
      </PageFormCard>
    </section>
  );
}

function ActionFieldItem({ actionField }: { actionField: ActionField }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const updateActionFieldForm = useForm<UpdateActionFieldForm>({
    resolver: zodResolver(UpdateActionFieldFormSchema),
    defaultValues: actionField,
  });

  return (
    <div className="flex items-center gap-3">
      <IconButton
        icon={(props) => <DotsSixVertical {...props} />}
        label="Drag to reorder"
        className="cursor-grab active:cursor-grabbing"
      />
      <div
        data-expanded={isExpanded}
        className="rounded-lg p-4 bg-gray-50 shadow-haptic-gray-300 flex-1 group"
      >
        <div className="gap-4 group-data-[expanded=true]:grid group-data-[expanded=false]:flex">
          <Textbox
            {...updateActionFieldForm.register('name')}
            label="Name"
            placeholder="Enter name"
          />
          <Textbox
            {...updateActionFieldForm.register('label')}
            label="Label"
            placeholder="Enter label"
          />
          <Controller
            control={updateActionFieldForm.control}
            name="type"
            render={({ field }) => (
              <Select
                items={actionFieldTypeOptions}
                onChange={(e) => {
                  const value = e.value[0];
                  if (ActionFieldTypeEnum.safeParse(value).success) {
                    field.onChange(value);
                  }
                }}
                value={[field.value]}
              >
                <SelectLabel>Type</SelectLabel>
                <SelectTrigger placeholder="Select type" className="w-40" />
                <SelectContent>
                  {actionFieldTypeOptions.map((option) => (
                    <SelectOption key={option.value} item={option}>
                      {option.label}
                    </SelectOption>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            control={updateActionFieldForm.control}
            name="is_required"
            render={({ field }) => (
              <Checkbox
                label="Required"
                onChange={({ checked }) => {
                  field.onChange(checked === true);
                }}
                checked={field.value}
                className="group-data-[expanded=false]:pt-6"
              />
            )}
          />

          <button
            onClick={() => {
              setIsExpanded((prev) => !prev);
            }}
            className="inline-flex items-center gap-x-1.5 text-xs text-gray-500 hover:underline underline-offset-2 group-data-[expanded=false]:hidden"
          >
            Hide advanced
            <CaretDown className="w-3 h-3 rotate-180" />
          </button>

          <div
            className={cn(
              'gap-4',
              'group-data-[expanded=false]:hidden',
              'group-data-[expanded=true]:grid',
            )}
          >
            <Textbox
              {...updateActionFieldForm.register('placeholder')}
              label="Placeholder"
              placeholder="Enter placeholder"
            />
            <Textbox
              {...updateActionFieldForm.register('helper_text')}
              label="Helper Text"
              placeholder="Enter helper text"
            />
          </div>

          <div className="flex items-end pt-0.5">
            <SaveButton type="submit" variant="plain" />
          </div>
        </div>
        <button
          onClick={() => {
            setIsExpanded((prev) => !prev);
          }}
          className="inline-flex items-center gap-x-1.5 text-xs text-gray-500 mt-2 hover:underline underline-offset-2 group-data-[expanded=true]:hidden"
        >
          Show advanced
          <CaretDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
