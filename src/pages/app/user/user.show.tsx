import { AppPageTitle } from '../_components/page-title.app';
import { User, UserSchema, UpdateUserSchema } from '@/schemas/user.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { api } from '@/libs/api.lib';
import {
  Select,
  SelectContent,
  SelectLabel,
  SelectOption,
  SelectTrigger,
} from '@/components/base/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { userRoleOptions } from '@/utils/user.util';
import { UserShowRequestSchema, fetchUserShowQuery, useUserShowQuery } from '@/queries/user.query';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { Textbox } from '@/components/derived/textbox';
import { Label } from '@/components/base/label';
import { Card } from '@/components/base/card';
import { Skeleton } from '@/components/base/skeleton';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageBackLink } from '../_components/page-back-link';
import { DeactivateUserDialog } from './_components/deactivate-user-dialog';
import { ActivateUserDialog } from './_components/activate-user-dialog';
import { SaveButton } from '@/components/derived/save-button';
import { toast } from '@/components/base/toast';
import { RestoreUserDialog } from './_components/restore-user-dialog';
import { ArchiveUserDialog } from './_components/archive-user-dialog';
import { ArchiveButton } from '@/components/derived/archive-button';
import { RestoreButton } from '@/components/derived/restore-button';
import { ActiveBadge, InactiveBadge } from '@/components/derived/activity-badge';
import { IconButton } from '@/components/base/button';
import { ArrowsClockwise, Question } from '@phosphor-icons/react';
import { cn } from '@/libs/cn.lib';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/base/popover';

function loader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const requestData = UserShowRequestSchema.parse(params);

    await fetchUserShowQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Edit User',
      data: { request: requestData },
    });
  };
}

UserShowPage.loader = loader;

export function UserShowPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const userShowQuery = useUserShowQuery({ id: loaderData.data.request.id });
  const user = userShowQuery.data?.data;

  const updateUserForm = useForm<UpdateUserSchema>({
    resolver: zodResolver(UpdateUserSchema),
    values: user,
  });

  const updateUserMutation = useUpdateUserMutation({
    userId: loaderData.data.request.id,
  });

  const onSubmit = updateUserForm.handleSubmit((data) => {
    updateUserMutation.mutate(data);
  });

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/users" />
      <div className="flex items-center mt-4">
        <AppPageTitle title={loaderData.pageTitle} />

        <div className="ml-auto flex gap-2">
          {user &&
            (user.is_archived ? (
              <RestoreUserDialog
                userId={user.id}
                userFullName={user.full_name}
                trigger={<RestoreButton type="button" />}
              />
            ) : (
              <ArchiveUserDialog
                userId={user.id}
                userFullName={user.full_name}
                trigger={<ArchiveButton type="button" />}
              />
            ))}
        </div>
      </div>
      <Card className="px-4.5 py-5 mt-6 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form id="update-user-form" onSubmit={onSubmit} className="flex flex-col gap-y-4">
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="full_name">Full Name</Label>
            <div className="col-span-3">
              {userShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {userShowQuery.isSuccess && (
                <Textbox
                  {...updateUserForm.register('full_name')}
                  label="Full Name"
                  placeholder="Enter Full Name"
                  disabled={updateUserMutation.isPending}
                  error={updateUserForm.formState.errors.full_name?.message}
                  readOnly={!user?.is_active}
                  noLabel
                />
              )}
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="email">Email</Label>
            <div className="col-span-3">
              {userShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {userShowQuery.isSuccess && (
                <Textbox
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter Email"
                  disabled={updateUserMutation.isPending}
                  value={user?.email}
                  readOnly
                  noLabel
                />
              )}
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="role">Role</Label>
            <div className="col-span-3">
              {userShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {userShowQuery.isSuccess && (
                <div className="grid w-full items-center gap-1.5">
                  <Controller
                    control={updateUserForm.control}
                    name="role"
                    render={({ field }) => (
                      <Select
                        name={field.name}
                        items={userRoleOptions}
                        onValueChange={(e) => {
                          const value = e?.value[0];

                          if (value === 'all' || value === 'super_admin' || value === 'operator') {
                            field.onChange(value);
                          }
                        }}
                        value={field.value ? [field.value] : []}
                      >
                        <SelectLabel className="sr-only">Role</SelectLabel>
                        <SelectTrigger placeholder="Select role" className="w-full" />
                        <SelectContent>
                          {userRoleOptions.map((option) => (
                            <SelectOption key={option.value} item={option} />
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <div className="flex items-center gap-2">
              <Label htmlFor="status">Status</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <IconButton
                    type="button"
                    tooltip="What's status?"
                    icon={(props) => <Question {...props} />}
                  />
                </PopoverTrigger>
                <PopoverContent className="max-w-xs">
                  <div className="grid gap-1">
                    <p>
                      User status only determines whether the user can log in to the system or not.
                    </p>
                    <p>If you consider the user as unused, archive the user instead.</p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="col-span-3">
              {user && (
                <div className="flex items-center gap-2">
                  {user.is_active ? (
                    <>
                      <ActiveBadge />
                      <DeactivateUserDialog
                        userId={user.id}
                        userFullName={user.full_name}
                        trigger={
                          <IconButton
                            type="button"
                            id="status"
                            role="switch"
                            label="Deactivate"
                            tooltip="Deactivate"
                            disabledTooltip="You can't deactivate an archived user"
                            disabled={user.is_archived}
                            icon={({ className, ...props }) => (
                              <ArrowsClockwise
                                className={cn(
                                  className,
                                  'transition-transform',
                                  'group-enabled:group-data-[loading=false]:group-hover:rotate-90',
                                  'group-data-[loading=true]:animate-spin',
                                )}
                                {...props}
                              />
                            )}
                            className="group"
                          />
                        }
                      />
                    </>
                  ) : (
                    <>
                      <InactiveBadge />
                      <ActivateUserDialog
                        userId={user.id}
                        userFullName={user.full_name}
                        trigger={
                          <IconButton
                            type="button"
                            id="status"
                            role="switch"
                            label="Activate"
                            tooltip="Activate"
                            disabledTooltip="You can't activate an archived user"
                            disabled={user.is_archived}
                            icon={({ className, ...props }) => (
                              <ArrowsClockwise
                                className={cn(
                                  className,
                                  'transition-transform',
                                  'group-enabled:group-data-[loading=false]:group-hover:rotate-90',
                                  'group-data-[loading=true]:animate-spin',
                                )}
                                {...props}
                              />
                            )}
                            className="group"
                          />
                        }
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          {user?.is_active && (
            <div className="flex justify-end">
              <SaveButton
                form="update-user-form"
                type="submit"
                loading={updateUserMutation.isPending}
                success={updateUserMutation.isSuccess && !updateUserForm.formState.isDirty}
              />
            </div>
          )}
        </form>
      </Card>
    </AppPageContainer>
  );
}

const UpdateUserResponseSchema = APIResponseSchema({
  schema: UserSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

type UseUpdateUserMutationParams = {
  userId: User['id'];
};

function useUpdateUserMutation({ userId }: UseUpdateUserMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateUserSchema) {
      try {
        const res = await api.put(data, `/users/${userId}`);

        return UpdateUserResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      toast.create({
        title: 'User updated successfully',
        type: 'success',
      });

      await queryClient.invalidateQueries({ queryKey: ['user', 'index'] });
      await queryClient.invalidateQueries({ queryKey: ['user', 'show', userId] });
    },
  });
}
