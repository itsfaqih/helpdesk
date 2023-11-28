import * as React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppPageTitle } from '../_components/page-title.app';
import { APIResponseSchema } from '@/schemas/api.schema';
import {
  Action,
  ActionFormMethodEnum,
  ActionSchema,
  UpdateActionFormSchema,
  UpdateActionSchema,
} from '@/schemas/action.schema';
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
import { ArrowsClockwise, CaretDown, DotsSixVertical, Plus, Trash } from '@phosphor-icons/react';
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
  CreateActionFieldSchema,
  UpdateActionFieldSchema,
  ActionFieldSchema,
  DeleteActionFieldSchema,
} from '@/schemas/action-field.schema';
import { Checkbox } from '@/components/derived/checkbox';
import { Card } from '@/components/base/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/base/tooltip';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/base/popover';
import { Portal } from '@ark-ui/react';
import slugify from 'slugify';
import { useAutoAnimate } from '@formkit/auto-animate/react';

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

  const updateActionForm = useForm<UpdateActionFormSchema>({
    resolver: zodResolver(UpdateActionFormSchema),
    defaultValues: {
      icon_type: action?.icon_type,
      icon_value: action?.icon_value,
      description: action?.description,
      label: action?.label,
    },
  });

  const updateActionMutation = useUpdateActionMutation({
    actionId: loaderData.data.request.id,
  });

  const onSubmit = updateActionForm.handleSubmit((data) => {
    updateActionMutation.mutate(data);
  });

  React.useEffect(() => {
    updateActionForm.reset({
      icon_type: action?.icon_type,
      icon_value: action?.icon_value,
      description: action?.description,
      label: action?.label,
    });
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
              <ArchiveActionDialog actionId={action.id} trigger={<ArchiveButton type="button" />} />
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
                      value={field.value ? { emojiId: field.value } : undefined}
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
                  id="label"
                  label="Label"
                  placeholder="Enter Label"
                  disabled={updateActionMutation.isPending}
                  error={updateActionForm.formState.errors.label?.message}
                  noLabel
                />
              </div>
            </div>
            <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
              <Label htmlFor="description">Description</Label>
              <div className="col-span-3">
                <TextAreabox
                  {...updateActionForm.register('description')}
                  id="description"
                  label="Description"
                  placeholder="Enter Description"
                  disabled={updateActionMutation.isPending}
                  error={updateActionForm.formState.errors.description?.message}
                  noLabel
                  rows={3}
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
                            tooltip="Disable"
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
                            tooltip="Enable"
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
                loading={updateActionMutation.isPending}
                success={updateActionMutation.isSuccess && !updateActionForm.formState.isDirty}
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
      await queryClient.invalidateQueries({ queryKey: ['action', 'index'] });
      await queryClient.invalidateQueries({ queryKey: ['action', 'show', actionId] });
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
  const [autoAnimateParent, setIsAutoAnimateEnabled] = useAutoAnimate();
  const [actionFieldToEdit, setActionFieldToEdit] = React.useState<ActionField>();

  const actionShowQuery = useActionShowQuery({ id: actionId });
  const action = actionShowQuery.data?.data;
  const [actionFieldItems, setActionFieldItems] = React.useState<ActionField[]>(
    action?.fields ?? [],
  );

  const httpMethodOptions = ActionFormMethodEnum.options.map((method) => ({
    label: method,
    value: method,
  }));

  const updateActionForm = useForm<UpdateActionFormSchema>({
    resolver: zodResolver(UpdateActionFormSchema),
    defaultValues: {
      form_method: action?.form_method ?? 'GET',
      webhook_url: action?.webhook_url,
    },
  });

  const createActionFieldMutation = useCreateActionFieldMutation();

  const updateActionFieldMutation = useUpdateActionFieldMutation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over !== null && active.id !== over.id) {
      setActionFieldItems((curActionFieldItems) => {
        const oldIndex = curActionFieldItems.findIndex(({ id }) => id === active.id);
        const newIndex = curActionFieldItems.findIndex(({ id }) => id === over.id);

        return arrayMove(curActionFieldItems, oldIndex, newIndex);
      });

      const targetActionFieldOrder = action?.fields.find(({ id }) => id === over.id)?.order;

      if (targetActionFieldOrder !== undefined) {
        updateActionFieldMutation.mutate({
          id: active.id as string,
          action_id: actionId,
          order: targetActionFieldOrder,
        });
      }
    }

    setTimeout(() => {
      setIsAutoAnimateEnabled(true);
    }, 100);
  }

  React.useEffect(() => {
    if (action?.fields) {
      setActionFieldItems(action?.fields);
    }
  }, [action?.fields]);

  return (
    <section className={className}>
      <PageSectionTitle>Action's Form</PageSectionTitle>
      <PageFormCard className="mt-4 bg-haptic-gray-100">
        {actionShowQuery.isLoading && <>Loading...</>}
        {actionShowQuery.isSuccess && action && (
          <div className="w-full grid grid-cols-3 gap-4">
            <Card className="p-4 col-span-2">
              <div ref={autoAnimateParent} className="flex flex-col gap-3">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={() => {
                    setIsAutoAnimateEnabled(false);
                  }}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={actionFieldItems} strategy={verticalListSortingStrategy}>
                    {actionFieldItems.map((field) => (
                      <ActionFieldItem
                        key={field.id}
                        actionField={field}
                        isEditing={actionFieldToEdit?.id === field.id}
                        onClickEditButton={(actionField) => {
                          setActionFieldToEdit(actionField);
                        }}
                        onCancelEdit={() => {
                          setActionFieldToEdit(undefined);
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
              <div className="pl-12 mt-3">
                <Button
                  type="button"
                  variant="white"
                  leading={(props) => <Plus {...props} />}
                  onClick={() => {
                    createActionFieldMutation.mutate({
                      action_id: actionId,
                      helper_text: '',
                      is_required: false,
                      label: 'Untitled',
                      name: 'untitled',
                      placeholder: '',
                      type: 'text',
                    });
                  }}
                  loading={createActionFieldMutation.isPending}
                  className="w-full justify-center"
                >
                  Add field
                </Button>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-gray-600 text-sm">Property</h3>
              <div className="mt-4 flex flex-col gap-4">
                <Textbox
                  {...updateActionForm.register('webhook_url')}
                  label="Webhook URL"
                  placeholder="Enter webhook URL"
                />
                <Controller
                  control={updateActionForm.control}
                  name="form_method"
                  render={({ field }) => (
                    <Select
                      items={httpMethodOptions}
                      onValueChange={(e) => {
                        const value = e.value[0];
                        if (ActionFormMethodEnum.safeParse(value).success) {
                          field.onChange(value);
                        }
                      }}
                      value={field.value ? [field.value] : []}
                    >
                      <SelectLabel>Method</SelectLabel>
                      <SelectTrigger placeholder="Select method" className="w-40" />
                      <SelectContent>
                        {httpMethodOptions.map((option) => (
                          <SelectOption key={option.value} item={option}>
                            {option.label}
                          </SelectOption>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </Card>
          </div>
        )}
      </PageFormCard>
    </section>
  );
}

function ActionFieldItem({
  actionField,
  isEditing,
  onClickEditButton,
  onCancelEdit,
}: {
  actionField: ActionField;
  isEditing: boolean;
  onClickEditButton: (actionField: ActionField) => void;
  onCancelEdit: () => void;
}) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: actionField.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
  };

  const [isShowingAdvanced, setIsShowingAdvanced] = React.useState(false);
  const [isNameChangedManually, setIsNameChangedManually] = React.useState(false);

  const updateActionFieldForm = useForm<UpdateActionFieldForm>({
    resolver: zodResolver(UpdateActionFieldFormSchema),
    defaultValues: {
      name: actionField.name,
      label: actionField.label,
      type: actionField.type,
      placeholder: actionField.placeholder,
      helper_text: actionField.helper_text,
      is_required: actionField.is_required,
    },
  });

  const deleteActionFieldMutation = useDeleteActionFieldMutation();
  const updateActionFieldMutation = useUpdateActionFieldMutation();

  const [autoAnimateParentRef] = useAutoAnimate();

  return (
    <div
      ref={setNodeRef}
      key={actionField.id}
      style={style}
      className={cn('flex items-center gap-4', {
        'z-10': isDragging,
      })}
    >
      <IconButton
        ref={setActivatorNodeRef}
        icon={(props) => <DotsSixVertical {...props} />}
        tooltip="Drag to reorder"
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
        containerClassName="peer"
      />
      <Popover
        open={isEditing}
        onOpenChange={({ open }) => {
          if (open) {
            onClickEditButton(actionField);
          } else {
            onCancelEdit();
            updateActionFieldMutation.reset();
            setIsShowingAdvanced(false);
          }
        }}
        positioning={{ placement: 'right-start' }}
        portalled
      >
        <PopoverAnchor asChild>
          <div
            className={cn(
              'bg-white relative px-4 pt-3 pb-4 flex-1 border-gray-300 border-2 border-dashed rounded-lg transition-all',
              'hover:border-gray-400 hover:scale-105 hover:shadow-lg',
              'peer-hover:border-gray-400',
              'peer-active:border-gray-400 peer-active:scale-105 peer-active:shadow-lg',
              {
                'border-gray-400 scale-105 shadow-lg': isEditing,
                'opacity-75': deleteActionFieldMutation.isPending,
              },
            )}
          >
            {!isEditing && (
              <Tooltip positioning={{ placement: 'right' }}>
                <TooltipTrigger asChild>
                  <div className="w-full h-full absolute inset-0">
                    <PopoverTrigger asChild>
                      <button className="block w-full h-full">
                        <span className="sr-only">Edit field</span>
                      </button>
                    </PopoverTrigger>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Click to edit</TooltipContent>
              </Tooltip>
            )}
            {updateActionFieldForm.watch('type') === 'text' && (
              <Textbox
                label={updateActionFieldForm.watch('label')}
                placeholder={updateActionFieldForm.watch('placeholder')}
                optional={!updateActionFieldForm.watch('is_required')}
                helperText={updateActionFieldForm.watch('helper_text')}
                tabIndex={-1}
                className="pointer-events-none"
              />
            )}
            {updateActionFieldForm.watch('type') === 'textarea' && (
              <TextAreabox
                label={updateActionFieldForm.watch('label')}
                placeholder={updateActionFieldForm.watch('placeholder')}
                rows={4}
                optional={!updateActionFieldForm.watch('is_required')}
                helperText={updateActionFieldForm.watch('helper_text')}
                tabIndex={-1}
                containerClassName="pointer-events-none"
              />
            )}
            {updateActionFieldForm.watch('type') === 'file' && (
              <Textbox
                label={updateActionFieldForm.watch('label')}
                type="file"
                optional={!updateActionFieldForm.watch('is_required')}
                helperText={updateActionFieldForm.watch('helper_text')}
                tabIndex={-1}
                className="pointer-events-none"
              />
            )}
          </div>
        </PopoverAnchor>
        <Portal>
          <PopoverContent className="p-4">
            <form
              onSubmit={updateActionFieldForm.handleSubmit((data) => {
                updateActionFieldMutation.mutate({
                  ...data,
                  id: actionField.id,
                  action_id: actionField.action_id,
                });
              })}
            >
              <div className="flex flex-col gap-4">
                <Textbox
                  {...updateActionFieldForm.register('label', {
                    onChange(event: React.ChangeEvent<HTMLInputElement>) {
                      if (!isNameChangedManually) {
                        updateActionFieldForm.setValue(
                          'name',
                          slugify(event.target.value, {
                            lower: true,
                            trim: true,
                            replacement: '_',
                          }),
                        );
                      }
                    },
                  })}
                  label="Label"
                  placeholder="Enter label"
                  disabled={deleteActionFieldMutation.isPending}
                />
                <Textbox
                  {...updateActionFieldForm.register('name', {
                    onChange() {
                      if (!isNameChangedManually) {
                        setIsNameChangedManually(true);
                      }
                    },
                  })}
                  label="Name"
                  placeholder="Enter name"
                  disabled={deleteActionFieldMutation.isPending}
                />
                <Controller
                  control={updateActionFieldForm.control}
                  name="type"
                  render={({ field }) => (
                    <Select
                      value={[field.value]}
                      onValueChange={(e) => {
                        const value = e.value[0];
                        if (ActionFieldTypeEnum.safeParse(value).success) {
                          field.onChange(value);
                        }
                      }}
                      items={actionFieldTypeOptions}
                      disabled={deleteActionFieldMutation.isPending}
                    >
                      <SelectLabel>Type</SelectLabel>
                      <SelectTrigger placeholder="Select type" />
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
                      checked={field.value === true}
                      onCheckedChange={({ checked }) => {
                        field.onChange(checked === true);
                      }}
                      disabled={deleteActionFieldMutation.isPending}
                    />
                  )}
                />
                <div className="flex">
                  <Button
                    type="button"
                    size="sm"
                    leading={({ className, ...props }) => (
                      <CaretDown
                        {...props}
                        className={cn('transition-transform', className, {
                          '-rotate-180': isShowingAdvanced,
                        })}
                      />
                    )}
                    onClick={() => setIsShowingAdvanced((prev) => !prev)}
                  >
                    {isShowingAdvanced ? 'Hide advanced' : 'Show advanced'}
                  </Button>
                </div>
              </div>
              <div ref={autoAnimateParentRef} className="overflow-hidden -m-1 p-1">
                {isShowingAdvanced && (
                  <div className="flex flex-col gap-4 pt-4">
                    {updateActionFieldForm.watch('type') !== 'file' && (
                      <Textbox
                        {...updateActionFieldForm.register('placeholder')}
                        label="Placeholder"
                        placeholder="Enter placeholder"
                        disabled={deleteActionFieldMutation.isPending}
                      />
                    )}
                    <Textbox
                      {...updateActionFieldForm.register('helper_text')}
                      label="Helper text"
                      placeholder="Enter helper text"
                      disabled={deleteActionFieldMutation.isPending}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button
                  type="button"
                  variant="white"
                  severity="danger"
                  leading={(props) => <Trash {...props} />}
                  onClick={() => {
                    deleteActionFieldMutation.mutate({
                      id: actionField.id,
                      action_id: actionField.action_id,
                    });
                  }}
                  loading={deleteActionFieldMutation.isPending}
                  success={deleteActionFieldMutation.isSuccess}
                  className="w-full justify-center"
                >
                  Remove
                </Button>
                <SaveButton
                  type="submit"
                  disabled={deleteActionFieldMutation.isPending}
                  loading={updateActionFieldMutation.isPending}
                  success={updateActionFieldMutation.isSuccess}
                  className="w-full justify-center"
                />
              </div>
            </form>
          </PopoverContent>
        </Portal>
      </Popover>
    </div>
  );
}

const CreateActionFieldResponseSchema = APIResponseSchema({
  schema: ActionFieldSchema,
});

function useCreateActionFieldMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: CreateActionFieldSchema) {
      try {
        const res = await api.post(data, `/actions/${data.action_id}/fields`);

        return CreateActionFieldResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess(data) {
      await queryClient.invalidateQueries({ queryKey: ['action', 'show', data.data.action_id] });
    },
  });
}

const UpdateActionFieldResponseSchema = APIResponseSchema({
  schema: ActionFieldSchema,
});

function useUpdateActionFieldMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateActionFieldSchema) {
      try {
        const res = await api.put(data, `/actions/${data.action_id}/fields/${data.id}`);

        return UpdateActionFieldResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess(data) {
      await queryClient.invalidateQueries({ queryKey: ['action', 'show', data.data.action_id] });
    },
    async onSettled(_, __, variables) {
      if (variables.order) {
        await queryClient.invalidateQueries({ queryKey: ['action', 'show', variables.action_id] });
      }
    },
  });
}

function useDeleteActionFieldMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: DeleteActionFieldSchema) {
      try {
        const res = await api.delete(`/actions/${data.action_id}/fields/${data.id}`);

        return res;
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess(_, variables) {
      await queryClient.invalidateQueries({ queryKey: ['action', 'show', variables.action_id] });
    },
  });
}
