import { AppPageTitle } from "../_components/page-title.app";
import { APIResponseSchema } from "@/schemas/api.schema";
import { AdminSchema, CreateAdminSchema } from "@/schemas/admin.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ConflictError } from "@/utils/error.util";
import { api } from "@/libs/api.lib";
import {
  Select,
  SelectLabel,
  SelectTrigger,
  SelectContent,
  SelectOption,
} from "@/components/base/select";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textbox } from "@/components/derived/textbox";
import { adminRoleOptions } from "@/utils/admin.util";
import { Label } from "@/components/base/label";
import { Card } from "@/components/base/card";
import { Button } from "@/components/base/button";
import { Link } from "@/components/base/link";
import { CaretLeft } from "@phosphor-icons/react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { AppPageContainer } from "@/components/derived/app-page-container";

function loader() {
  return async () => {
    return loaderResponse({
      pageTitle: "Create Administrator",
    });
  };
}

AdminCreatePage.loader = loader;

export function AdminCreatePage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;

  const navigate = useNavigate();
  const createAdminForm = useForm<CreateAdminSchema>({
    resolver: zodResolver(CreateAdminSchema),
  });

  const createAdminMutation = useCreateAdminMutation();

  const onSubmit = createAdminForm.handleSubmit((data) => {
    createAdminMutation.mutate(data, {
      onSuccess(res) {
        navigate(`/admins/${res.data.id}`);
      },
    });
  });

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
          id="create-admin-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-y-4"
        >
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="full_name">Full Name</Label>
            <div className="col-span-3">
              <Textbox
                {...createAdminForm.register("full_name")}
                label="Full Name"
                placeholder="Enter Full Name"
                disabled={createAdminMutation.isLoading}
                error={createAdminForm.formState.errors.full_name?.message}
                srOnlyLabel
                errorPlaceholder
              />
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="email">Email</Label>
            <div className="col-span-3">
              <Textbox
                {...createAdminForm.register("email")}
                label="Email"
                type="email"
                placeholder="Enter Email"
                disabled={createAdminMutation.isLoading}
                error={createAdminForm.formState.errors.email?.message}
                srOnlyLabel
                errorPlaceholder
              />
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="password">Password</Label>
            <div className="col-span-3">
              <Textbox
                {...createAdminForm.register("password")}
                label="Password"
                type="password"
                placeholder="Enter Password"
                disabled={createAdminMutation.isLoading}
                error={createAdminForm.formState.errors.password?.message}
                srOnlyLabel
                errorPlaceholder
              />
            </div>
          </div>
          <div className="flex flex-col grid-cols-4 gap-1.5 sm:grid">
            <Label htmlFor="role">Role</Label>
            <div className="col-span-3">
              <Controller
                control={createAdminForm.control}
                name="role"
                render={({ field }) => (
                  <Select
                    name={field.name}
                    disabled={createAdminMutation.isLoading}
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
                              createAdminForm.formState.errors.role?.message
                            }
                            errorPlaceholder
                            className="w-full"
                          >
                            {(selectedOption as { label?: string })?.label ??
                              "Select role"}
                          </SelectTrigger>
                        </div>
                        <SelectContent>
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
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              type="submit"
              loading={createAdminMutation.isLoading}
              success={createAdminMutation.isSuccess}
            >
              Create Admin
            </Button>
          </div>
        </form>
      </Card>
    </AppPageContainer>
  );
}

const CreateAdminResponseSchema = APIResponseSchema({
  schema: AdminSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

function useCreateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: CreateAdminSchema) {
      try {
        const res = await api.post(data, "/admins");

        return CreateAdminResponseSchema.parse(res);
      } catch (error) {
        if (error instanceof ConflictError) {
          throw new Error("Email is already registered");
        }

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
