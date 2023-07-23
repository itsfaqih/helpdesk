import React from "react";
import { AppPageTitle } from "../_components/page-title.app";
import { Admin, AdminSchema, UpdateAdminSchema } from "@/schemas/admin.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { api } from "@/libs/api.lib";
import {
  Select,
  SelectContent,
  SelectLabel,
  SelectOption,
  SelectTrigger,
} from "@/components/base/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { adminRoleOptions } from "@/utils/admin";
import {
  AdminShowRequestSchema,
  fetchAdminShowQuery,
  useAdminShowQuery,
} from "@/queries/admin.query";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { Textbox } from "@/components/derived/textbox";
import { Button } from "@/components/base/button";
import { Label } from "@/components/base/label";
import { Card } from "@/components/base/card";
import { Link } from "@/components/base/link";
import { CaretLeft } from "@phosphor-icons/react";
import { Skeleton } from "@/components/base/skeleton";
import { AppPageContainer } from "@/components/derived/app-page-container";

function loader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const requestData = AdminShowRequestSchema.parse(params);

    await fetchAdminShowQuery({ queryClient, request: requestData }).catch(
      (err) => {
        console.error(err);
      }
    );

    return loaderResponse({
      pageTitle: "Edit Administrator",
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
      <Link
        variant="plain"
        to="/admins"
        className="inline-flex items-center gap-x-1.5"
      >
        <CaretLeft className="w-4 h-4" />
        <span>Back</span>
      </Link>
      <AppPageTitle title={loaderData.pageTitle} className="mt-4" />
      <Card className="px-4.5 py-5 mt-7 sm:mx-0 -mx-6 sm:rounded-md rounded-none">
        <form
          id="update-admin-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-y-4"
        >
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="full_name">Full Name</Label>
            <div className="col-span-3">
              {adminShowQuery.isLoading && <Skeleton className="mb-6 h-9" />}
              {adminShowQuery.isSuccess && (
                <Textbox
                  {...updateAdminForm.register("full_name")}
                  label="Full Name"
                  placeholder="Enter Full Name"
                  disabled={updateAdminMutation.isLoading}
                  error={updateAdminForm.formState.errors.full_name?.message}
                  srOnlyLabel
                  errorPlaceholder
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
                  errorPlaceholder
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
                      onChange={(selectedOption) => {
                        const value = selectedOption?.value;
                        if (value === "super_admin" || value === "operator") {
                          field.onChange(value);
                        }
                      }}
                      selectedOption={adminRoleOptions.find(
                        (role) => role.value === field.value
                      )}
                    >
                      {({ selectedOption }) => (
                        <>
                          <div className="grid w-full items-center gap-1.5">
                            <SelectLabel className="sr-only">Role</SelectLabel>
                            <SelectTrigger
                              ref={field.ref}
                              error={
                                updateAdminForm.formState.errors.role?.message
                              }
                              errorPlaceholder
                              className="w-full"
                            >
                              {(selectedOption as { label?: string })?.label ??
                                "Select role"}
                            </SelectTrigger>
                          </div>
                          <SelectContent className="w-full">
                            {adminRoleOptions.map((role) => (
                              <SelectOption
                                key={role.value}
                                value={role.value}
                                label={role.label}
                              />
                            ))}
                          </SelectContent>
                        </>
                      )}
                    </Select>
                  )}
                />
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              form="update-admin-form"
              type="submit"
              variant="primary"
              loading={updateAdminMutation.isLoading}
              success={
                updateAdminMutation.isSuccess &&
                !updateAdminForm.formState.isDirty
              }
            >
              Update Admin
            </Button>
          </div>
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
  adminId: Admin["id"];
};

function useUpdateAdminMutation({ adminId }: UseUpdateAdminMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: UpdateAdminSchema) {
      try {
        const res = await api.put(data, `/admins/${adminId}`);

        return UpdateAdminResponseSchema.parse(res);
      } catch (error) {
        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["admin", "index"]);
    },
  });
}
