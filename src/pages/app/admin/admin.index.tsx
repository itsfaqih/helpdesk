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
import { Admin, AdminSchema } from "@/schemas/admin.schema";
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
} from "@/queries/admin.query";
import {
  Link,
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import { LoaderDataReturn, loaderResponse } from "@/utils/router.util";
import { cn } from "@/libs/cn.lib";
import { Skeleton } from "@/components/base/skeleton";
import { linkClass } from "@/components/base/link";
import {
  Pagination,
  PaginationEllipsis,
  PaginationList,
  PaginationListItem,
  PaginationNextPageTrigger,
  PaginationPageTrigger,
  PaginationPrevPageTrigger,
} from "@/components/base/pagination";
import { FadeInContainer } from "@/components/base/fade-in-container";
import { useDebounce } from "@/hooks/use-debounce";
import { AppPageTitle } from "../_components/page-title.app";

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

AdminIndexPage.loader = loader;

export function AdminIndexPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;
  const [_, setSearchParams] = useSearchParams();

  const currentAdminQuery = useCurrentAdminQuery();
  const currentAdmin = currentAdminQuery.data?.data;

  const filtersForm = useForm<AdminIndexRequest>({
    resolver: zodResolver(AdminIndexRequestSchema),
    defaultValues: loaderData.data.request,
  });

  const [search, setSearch] = React.useState<string | null>(null);
  useDebounce(() => {
    if (search === null) return;
    filtersForm.setValue("search", search);
  }, 500);

  const adminIndexQuery = useAdminIndexQuery(loaderData.data.request);
  const admins = adminIndexQuery.data?.data ?? [];

  filtersForm.watch((data, { name }) => {
    if (name === "is_active") {
      data.search = undefined;
      data.role = undefined;
    }

    if (name !== "page") {
      data.page = undefined;
    }

    const queryStrings = qs.stringify(data);
    const searchParams = new URLSearchParams(queryStrings);

    setSearchParams(searchParams);
  });

  React.useEffect(() => {
    if (
      filtersForm.getValues("is_active") !== loaderData.data.request.is_active
    ) {
      filtersForm.setValue("is_active", loaderData.data.request.is_active);
    }
    if (filtersForm.getValues("role") !== loaderData.data.request.role) {
      filtersForm.setValue("role", loaderData.data.request.role);
    }
    if (filtersForm.getValues("search") !== loaderData.data.request.search) {
      filtersForm.setValue("search", loaderData.data.request.search);
    }
    if (filtersForm.getValues("page") !== loaderData.data.request.page) {
      filtersForm.setValue("page", loaderData.data.request.page);
    }
  }, [filtersForm, loaderData.data.request]);

  return (
    <FadeInContainer className="pb-5">
      <AppPageTitle
        title="Administrators"
        actions={
          currentAdmin?.role === "super_admin" && (
            <Button
              as={Link}
              to="/admins/create"
              variant="primary"
              leading={Plus}
            >
              New Admin
            </Button>
          )
        }
      />
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
          <Input
            name="search"
            onChange={(e) => setSearch(e.target.value)}
            value={search ?? ""}
            type="search"
            placeholder="Search by full name or email"
            className="flex-1"
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
                search: "",
                page: undefined,
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
      <div className="mt-5 min-h-[34.25rem]">
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
            {adminIndexQuery.isError && (
              <tr data-testid={`table-error`}>
                <td colSpan={5} className="py-3.5 px-3">
                  {(typeof adminIndexQuery.error === "object" &&
                    adminIndexQuery.error instanceof Error &&
                    adminIndexQuery.error.message) ||
                    undefined}
                  <button onClick={() => adminIndexQuery.refetch()}>
                    <button className={linkClass()}>Muat ulang</button>
                  </button>
                </td>
              </tr>
            )}
            {adminIndexQuery.isSuccess && admins.length === 0 && (
              <tr data-testid={`table-empty`}>
                <td
                  colSpan={5}
                  className="py-3.5 px-3 text-gray-500 text-center"
                >
                  No data
                </td>
              </tr>
            )}
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="py-3.5 pl-4 pr-3">{admin.full_name}</td>
                <td className="px-3 py-3.5">{admin.email}</td>
                <td className="px-3 py-3.5">{roleValueToLabel(admin.role)}</td>
                <td className="px-3 py-3.5">{admin.created_at}</td>
                <td className="flex items-center justify-end px-3 py-2.5 gap-x-1">
                  {currentAdmin?.id !== admin.id &&
                    currentAdmin?.role === "super_admin" &&
                    (admin.is_active ? (
                      <>
                        <IconButton
                          as={Link}
                          to={`/admins/${admin.id}`}
                          icon={PencilSimple}
                          label="Edit"
                        />

                        <DeactivateAdminDialog
                          adminId={admin.id}
                          trigger={
                            <IconButton
                              icon={Power}
                              label="Deactivate"
                              className="text-red-600"
                            />
                          }
                        />
                      </>
                    ) : (
                      <ReactivateAdminDialog
                        adminId={admin.id}
                        trigger={
                          <IconButton
                            icon={Power}
                            label="Reactivate"
                            className="text-green-600"
                          />
                        }
                      />
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {adminIndexQuery.isSuccess && adminIndexQuery.data.data.length > 0 && (
        <div className="mt-5">
          <Controller
            control={filtersForm.control}
            name="page"
            render={({ field }) => (
              <Pagination
                page={field.value ?? 1}
                count={adminIndexQuery.data.meta?.pagination?.total ?? 1}
                pageSize={adminIndexQuery.data.meta?.pagination?.per_page ?? 1}
                onChange={({ page }) => {
                  field.onChange(page);
                }}
                className="justify-center"
              >
                {({ pages }) => (
                  <PaginationList>
                    <PaginationListItem>
                      <PaginationPrevPageTrigger />
                    </PaginationListItem>
                    {/* temporarily cast type until it's properly typed */}
                    {(pages as { type: "page"; value: number }[]).map(
                      (page, index) =>
                        page.type === "page" ? (
                          <PaginationListItem key={index}>
                            <PaginationPageTrigger {...page}>
                              {page.value}
                            </PaginationPageTrigger>
                          </PaginationListItem>
                        ) : (
                          <PaginationListItem key={index}>
                            <PaginationEllipsis index={index}>
                              &#8230;
                            </PaginationEllipsis>
                          </PaginationListItem>
                        )
                    )}
                    <PaginationListItem>
                      <PaginationNextPageTrigger />
                    </PaginationListItem>
                  </PaginationList>
                )}
              </Pagination>
            )}
          />
        </div>
      )}
    </FadeInContainer>
  );
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
        const res = await api.put(undefined, `/admins/${adminId}/deactivate`);

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

type ReactivateAdminDialogProps = {
  adminId: Admin["id"];
  trigger: React.ReactNode;
};

function ReactivateAdminDialog({
  adminId,
  trigger,
}: ReactivateAdminDialogProps) {
  const [open, setOpen] = React.useState(false);

  const reactivateAdminMutation = useReactivateAdminMutation({ adminId });

  React.useEffect(() => {
    if (reactivateAdminMutation.isSuccess) {
      setOpen(false);
    }
  }, [reactivateAdminMutation.isSuccess]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[36rem]">
        <DialogHeader>
          <DialogTitle>Reactivate Admin</DialogTitle>
          <DialogDescription>
            Are you sure you want to reactivate this admin? After reactivating
            the admin will be able to login to the system
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5">
          <Button
            type="button"
            variant="primary"
            loading={reactivateAdminMutation.isLoading}
            success={reactivateAdminMutation.isSuccess}
            onClick={() => reactivateAdminMutation.mutate()}
          >
            Reactivate Admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ReactivateAdminResponseSchema = APIResponseSchema({
  schema: AdminSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

type UseReactivateAdminMutationParams = {
  adminId: Admin["id"];
};

function useReactivateAdminMutation({
  adminId,
}: UseReactivateAdminMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/admins/${adminId}/activate`);

        return ReactivateAdminResponseSchema.parse(res);
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
