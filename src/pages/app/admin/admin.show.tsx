import React from 'react';
import { AppPageTitle } from '../_components/page-title.app';
import { Admin, AdminSchema, UpdateAdminSchema } from '@/schemas/admin.schema';
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
import { adminRoleOptions } from '@/utils/admin.util';
import {
  AdminShowRequestSchema,
  fetchAdminShowQuery,
  useAdminShowQuery,
} from '@/queries/admin.query';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { Textbox } from '@/components/derived/textbox';
import { Label } from '@/components/base/label';
import { Card } from '@/components/base/card';
import { Skeleton } from '@/components/base/skeleton';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageBackLink } from '../_components/page-back-link';
import { DeactivateAdminDialog } from './_components/deactivate-admin-dialog';
import { ActivateAdminDialog } from './_components/activate-admin-dialog';
import { SaveButton } from '@/components/derived/save-button';
import { DeactivateButton } from '@/components/derived/deactivate-button';
import { ActivateButton } from '@/components/derived/activate-button';

function loader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const requestData = AdminShowRequestSchema.parse(params);

    await fetchAdminShowQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Edit Administrator',
      data: { request: requestData },
    });
  };
}

AdminShowPage.loader = loader;

export function AdminShowPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const adminShowQuery = useAdminShowQuery({ id: loaderData.data.request.id });
  const admin = adminShowQuery.data?.data;

  const updateAdminForm = useForm<UpdateAdminSchema>({
    resolver: zodResolver(UpdateAdminSchema),
    defaultValues: admin,
  });

  const updateAdminMutation = useUpdateAdminMutation({
    adminId: loaderData.data.request.id,
  });

  const onSubmit = updateAdminForm.handleSubmit((data) => {
    updateAdminMutation.mutate(data);
  });

  React.useEffect(() => {
    updateAdminForm.reset(admin);
  }, [admin, updateAdminForm]);

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageBackLink to="/admins" />
      <div className="flex items-center mt-4">
        <AppPageTitle title={loaderData.pageTitle} />

        <div className="ml-auto">
          {admin &&
            (admin.is_active ? (
              <DeactivateAdminDialog
                adminId={admin.id}
                trigger={<DeactivateButton type="button" data-testid="btn-deactivate-admin" />}
              />
            ) : (
              <ActivateAdminDialog
                adminId={admin.id}
                trigger={<ActivateButton type="button" data-testid="btn-reactivate-client" />}
              />
            ))}
        </div>
      </div>
      <Card className="px-4.5 py-5 mt-6 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form id="update-admin-form" onSubmit={onSubmit} className="flex flex-col gap-y-4">
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="full_name">Full Name</Label>
            <div className="col-span-3">
              {adminShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {adminShowQuery.isSuccess && (
                <Textbox
                  {...updateAdminForm.register('full_name')}
                  label="Full Name"
                  placeholder="Enter Full Name"
                  disabled={updateAdminMutation.isLoading}
                  error={updateAdminForm.formState.errors.full_name?.message}
                  readOnly={!admin?.is_active}
                  srOnlyLabel
                  data-testid="textbox-full-name"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="email">Email</Label>
            <div className="col-span-3">
              {adminShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {adminShowQuery.isSuccess && (
                <Textbox
                  label="Email"
                  type="email"
                  placeholder="Enter Email"
                  disabled={updateAdminMutation.isLoading}
                  value={admin?.email}
                  readOnly
                  srOnlyLabel
                  data-testid="textbox-email"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="role">Role</Label>
            <div className="col-span-3">
              {adminShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {adminShowQuery.isSuccess && (
                <Controller
                  control={updateAdminForm.control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      disabled={updateAdminMutation.isLoading}
                      items={adminRoleOptions}
                      onChange={(e) => {
                        const value = e?.value[0];

                        if (value === 'super_admin' || value === 'operator') {
                          field.onChange(value);
                        }
                      }}
                      value={[field.value]}
                      readOnly={!admin?.is_active}
                    >
                      <div className="grid w-full items-center gap-1.5">
                        <SelectLabel className="sr-only">Role</SelectLabel>
                        <SelectTrigger
                          ref={field.ref}
                          error={updateAdminForm.formState.errors.role?.message}
                          placeholder="Select role"
                          className="w-full"
                          data-testid="select-role"
                        />
                      </div>
                      <SelectContent className="w-full">
                        {adminRoleOptions.map((option) => (
                          <SelectOption
                            key={option.value}
                            item={option}
                            data-testid={`option-${option.value}`}
                          />
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </div>
          </div>
          {admin?.is_active && (
            <div className="flex justify-end">
              <SaveButton
                form="update-admin-form"
                type="submit"
                loading={updateAdminMutation.isLoading}
                success={updateAdminMutation.isSuccess && !updateAdminForm.formState.isDirty}
                data-testid="btn-update-admin"
              />
            </div>
          )}
        </form>
      </Card>
    </AppPageContainer>
  );
}

const UpdateAdminResponseSchema = APIResponseSchema({
  schema: AdminSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

type UseUpdateAdminMutationParams = {
  adminId: Admin['id'];
};

function useUpdateAdminMutation({ adminId }: UseUpdateAdminMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateAdminSchema) {
      try {
        const res = await api.put(data, `/admins/${adminId}`);

        return UpdateAdminResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['admin', 'index']);
      await queryClient.invalidateQueries(['admin', 'show', adminId]);
    },
  });
}
