import React from "react";
import { PencilSimple, Plus, Power } from "@phosphor-icons/react";
import { Controller, useForm } from "react-hook-form";
import qs from "qs";
import { Button, IconButton } from "@/components/base/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/base/dialog";
import { Input } from "@/components/base/input";
import {
  Select,
  SelectContent,
  SelectLabel,
  SelectOption,
  SelectTrigger,
} from "@/components/base/select";
import {
  TabIndicator,
  TabList,
  TabTrigger,
  Tabs,
} from "@/components/base/tabs";
import { Textbox } from "@/components/derived/textbox";
import {
  Admin,
  AdminSchema,
  AdminWithoutPassword,
  CreateAdminSchema,
  UpdateAdminSchema,
} from "@/schemas/admin.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/libs/api.lib";
import { APIResponseSchema } from "@/schemas/api.schema";
import { useCurrentAdminQuery } from "@/queries/current-admin.query";
import { roleValueToLabel } from "@/utils/admin-role.util";
import {
  AdminIndexRequest,
  AdminIndexRequestSchema,
  fetchAdminIndexQuery,
  useAdminIndexQuery,
} from "@/queries/admin.index.query";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { ConflictError } from "@/utils/error.util";
import { cn } from "@/libs/cn.lib";
import { Skeleton } from "@/components/base/skeleton";

const roles = [
  {
    label: "Super Admin",
    value: "super_admin",
  },
  {
    label: "Operator",
    value: "operator",
  },
];

function loader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const requestData = AdminIndexRequestSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    );

    fetchAdminIndexQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: "Administrators",
      data: { request: requestData },
    });
  };
}

export function AdminIndexPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;
  const [_, setSearchParams] = useSearchParams();

  const currentAdminQuery = useCurrentAdminQuery();
  const currentAdmin = currentAdminQuery.data?.data;

  const filtersForm = useForm<AdminIndexRequest>({
    resolver: zodResolver(AdminIndexRequestSchema),
    defaultValues: loaderData.data.request,
  });

  const adminIndexQuery = useAdminIndexQuery(loaderData.data.request);
  const admins = adminIndexQuery.data?.data;

  filtersForm.watch((data, { name }) => {
    if (name === "is_active") {
      data.search = undefined;
      data.role = undefined;
    }

    const queryStrings = qs.stringify(data);
    const searchParams = new URLSearchParams(queryStrings);

    setSearchParams(searchParams);
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Administrators</h1>
        {currentAdmin?.role === "super_admin" && (
          <CreateAdminDialog key={admins?.length} />
        )}
      </div>
      <Controller
        control={filtersForm.control}
        name="is_active"
        render={({ field }) => (
          <Tabs
            value={field.value ?? "1"}
            onChange={({ value }) => {
              if (value && (value === "1" || value === "0")) {
                field.onChange(value);
              }
            }}
            className="mt-5"
          >
            <TabList>
              <TabTrigger value="1">Active</TabTrigger>
              <TabTrigger value="0">Deactivated</TabTrigger>
              <TabIndicator />
            </TabList>
          </Tabs>
        )}
      />

      <div className="mt-5">
        <div className="flex items-center gap-x-3">
          <Controller
            control={filtersForm.control}
            name="search"
            render={({ field }) => (
              <Input
                ref={field.ref}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
                type="search"
                placeholder="Search by full name or email"
                className="flex-1"
              />
            )}
          />
          <Controller
            control={filtersForm.control}
            name="role"
            render={({ field }) => (
              <Select
                name={field.name}
                selectedOption={{
                  label: roleValueToLabel(field.value ?? ""),
                  value: field.value ?? "",
                }}
                onChange={(selectedOption) => {
                  const value = selectedOption?.value;

                  if (
                    value === "" ||
                    value === "super_admin" ||
                    value === "operator"
                  ) {
                    field.onChange(value);
                  }
                }}
              >
                {({ selectedOption }) => (
                  <>
                    <SelectLabel className="sr-only">Role</SelectLabel>
                    <SelectTrigger className="w-48">
                      {(selectedOption as { label?: string })?.label ??
                        "Select role"}
                    </SelectTrigger>
                    <SelectContent className="w-48">
                      <SelectOption value="" label="All role" />
                      <SelectOption value="super_admin" label="Super Admin" />
                      <SelectOption value="operator" label="Operator" />
                    </SelectContent>
                  </>
                )}
              </Select>
            )}
          />

          <Button
            onClick={() =>
              filtersForm.reset({
                is_active: loaderData.data.request.is_active,
                role: undefined,
                search: undefined,
              })
            }
            variant="transparent"
            type="reset"
            className="text-red-500"
          >
            Reset
          </Button>
        </div>
      </div>
      <div className="mt-5">
        <table className="w-full overflow-hidden text-sm rounded-md shadow-haptic-gray-300">
          <thead className="text-gray-500">
            <tr className="border-b border-gray-300">
              <th className="pl-4 pr-3 py-2.5 font-medium text-left">
                Full Name
              </th>
              <th className="px-3 py-2.5 font-medium text-left">Email</th>
              <th className="px-3 py-2.5 font-medium text-left">Role</th>
              <th className="px-3 py-2.5 font-medium text-left">
                Date created
              </th>
              <th>
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-800 divide-y divide-gray-300">
            {adminIndexQuery.isLoading && (
              <tr data-testid={`table-loading`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <td
                    key={i}
                    className={cn("py-3.5", {
                      "sm:pl-4": i === 0,
                      "relative px-3": i === 5 - 1,
                      "px-3": i !== 0 && i !== 5 - 1,
                    })}
                  >
                    <Skeleton />
                  </td>
                ))}
              </tr>
            )}
            {admins?.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="py-3.5 pl-4 pr-3">{admin.full_name}</td>
                <td className="px-3 py-3.5">{admin.email}</td>
                <td className="px-3 py-3.5">{roleValueToLabel(admin.role)}</td>
                <td className="px-3 py-3.5">{admin.created_at}</td>
                <td className="flex items-center justify-end px-3 py-2.5 gap-x-1">
                  {currentAdmin?.id !== admin.id &&
                    currentAdmin?.role === "super_admin" && (
                      <>
                        <UpdateAdminDialog
                          admin={admin}
                          trigger={
                            <IconButton icon={PencilSimple} label="Edit" />
                          }
                        />

                        <DeactivateAdminDialog
                          adminId={admin.id}
                          trigger={
                            <IconButton
                              icon={Power}
                              label="Deactivate"
                              className="text-red-500"
                            />
                          }
                        />
                      </>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

AdminIndexPage.loader = loader;

function CreateAdminDialog() {
  const [open, setOpen] = React.useState(false);

  const createAdminForm = useForm<CreateAdminSchema>({
    resolver: zodResolver(CreateAdminSchema),
  });

  const createAdminMutation = useCreateAdminMutation();

  const onSubmit = createAdminForm.handleSubmit((data) => {
    createAdminMutation.mutate(data, {
      onSuccess() {
        setOpen(false);
      },
    });
  });

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
        createAdminForm.reset();
      }}
      onOpen={() => setOpen(true)}
      closeOnOutsideClick={false}
    >
      <DialogTrigger asChild>
        <Button variant="primary" leading={Plus}>
          New Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Create New Admin</DialogTitle>
          <DialogDescription>
            Create new admin for managing the system
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-admin-form"
          onSubmit={onSubmit}
          className="flex flex-col pt-5 pb-8 gap-y-4.5"
        >
          <Textbox
            {...createAdminForm.register("full_name")}
            label="Full Name"
            placeholder="Enter Full Name"
            disabled={createAdminMutation.isLoading}
            error={createAdminForm.formState.errors.full_name?.message}
          />
          <Textbox
            {...createAdminForm.register("email")}
            label="Email"
            type="email"
            placeholder="Enter Email"
            disabled={createAdminMutation.isLoading}
            error={createAdminForm.formState.errors.email?.message}
          />
          <Textbox
            {...createAdminForm.register("password")}
            label="Password"
            type="password"
            placeholder="Enter Password"
            disabled={createAdminMutation.isLoading}
            error={createAdminForm.formState.errors.password?.message}
          />
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
                selectedOption={roles.find(
                  (role) => role.value === field.value
                )}
              >
                {({ selectedOption }) => (
                  <>
                    <div className="grid w-full items-center gap-1.5">
                      <SelectLabel>Role</SelectLabel>
                      <SelectTrigger
                        ref={field.ref}
                        error={createAdminForm.formState.errors.role?.message}
                        className="w-full"
                      >
                        {(selectedOption as { label?: string })?.label ??
                          "Select role"}
                      </SelectTrigger>
                    </div>
                    <SelectContent className="w-full">
                      <SelectOption value="super_admin" label="Super Admin" />
                      <SelectOption value="operator" label="Operator" />
                    </SelectContent>
                  </>
                )}
              </Select>
            )}
          />
        </form>
        <DialogFooter>
          <Button
            form="create-admin-form"
            type="submit"
            variant="primary"
            loading={createAdminMutation.isLoading}
            success={createAdminMutation.isSuccess}
          >
            Create Admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

type UpdateAdminDialogProps = {
  admin: AdminWithoutPassword;
  trigger: React.ReactNode;
};

function UpdateAdminDialog({ admin, trigger }: UpdateAdminDialogProps) {
  const [open, setOpen] = React.useState(false);

  const updateAdminForm = useForm<UpdateAdminSchema>({
    resolver: zodResolver(UpdateAdminSchema),
    defaultValues: admin,
  });

  const updateAdminMutation = useUpdateAdminMutation({ adminId: admin.id });

  const onSubmit = updateAdminForm.handleSubmit((data) => {
    updateAdminMutation.mutate(data);
  });

  React.useEffect(() => {
    updateAdminForm.reset(admin);
  }, [admin, updateAdminForm]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
        updateAdminForm.reset();
      }}
      onOpen={() => setOpen(true)}
      closeOnOutsideClick={false}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Update Admin</DialogTitle>
          <DialogDescription>Update admin data</DialogDescription>
        </DialogHeader>
        <form
          id="update-admin-form"
          onSubmit={onSubmit}
          className="flex flex-col pt-5 pb-8 gap-y-4.5"
        >
          <Textbox
            {...updateAdminForm.register("full_name")}
            label="Full Name"
            placeholder="Enter Full Name"
            disabled={updateAdminMutation.isLoading}
            error={updateAdminForm.formState.errors.full_name?.message}
          />
          <Textbox
            label="Email"
            type="email"
            placeholder="Enter Email"
            disabled={updateAdminMutation.isLoading}
            value={admin.email}
            readOnly
          />
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
                selectedOption={roles.find(
                  (role) => role.value === field.value
                )}
              >
                {({ selectedOption }) => (
                  <>
                    <div className="grid w-full items-center gap-1.5">
                      <SelectLabel>Role</SelectLabel>
                      <SelectTrigger
                        ref={field.ref}
                        error={updateAdminForm.formState.errors.role?.message}
                        className="w-full"
                      >
                        {(selectedOption as { label?: string })?.label ??
                          "Select role"}
                      </SelectTrigger>
                    </div>
                    <SelectContent className="w-full">
                      <SelectOption value="super_admin" label="Super Admin" />
                      <SelectOption value="operator" label="Operator" />
                    </SelectContent>
                  </>
                )}
              </Select>
            )}
          />
        </form>
        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

type DeactivateAdminDialogProps = {
  adminId: Admin["id"];
  trigger: React.ReactNode;
};

function DeactivateAdminDialog({
  adminId,
  trigger,
}: DeactivateAdminDialogProps) {
  const [open, setOpen] = React.useState(false);

  const deactivateAdminMutation = useDeactivateAdminMutation({ adminId });

  React.useEffect(() => {
    if (deactivateAdminMutation.isSuccess) {
      setOpen(false);
    }
  }, [deactivateAdminMutation.isSuccess]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[36rem]">
        <DialogHeader>
          <DialogTitle>Deactivate Admin</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate this admin? After deactivating,
            the admin will not be able to login to the system
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5">
          <Button
            type="button"
            variant="danger"
            loading={deactivateAdminMutation.isLoading}
            success={deactivateAdminMutation.isSuccess}
            onClick={() => deactivateAdminMutation.mutate()}
          >
            Deactivate Admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const DeactivateAdminResponseSchema = APIResponseSchema({
  schema: AdminSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

type UseDeactivateAdminMutationParams = {
  adminId: Admin["id"];
};

function useDeactivateAdminMutation({
  adminId,
}: UseDeactivateAdminMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(`/admins/${adminId}/deactivate`);

        return DeactivateAdminResponseSchema.parse(res);
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
