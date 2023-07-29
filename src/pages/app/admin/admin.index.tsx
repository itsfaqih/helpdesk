import React from "react";
import { PencilSimple, Plus, Power } from "@phosphor-icons/react";
import { Controller, useForm } from "react-hook-form";
import qs from "qs";
import { Button, IconButton } from "@/components/base/button";
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
import { useLoggedInAdminQuery } from "@/queries/logged-in-admin.query";
import { adminRoleValueToLabel } from "@/utils/admin.util";
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
import {
  Pagination,
  PaginationEllipsis,
  PaginationList,
  PaginationListItem,
  PaginationNextPageTrigger,
  PaginationPageTrigger,
  PaginationPrevPageTrigger,
} from "@/components/base/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { AppPageTitle } from "../_components/page-title.app";
import { Table } from "@/components/base/table";
import { formatDateTime } from "@/utils/date";
import { AppPageContainer } from "@/components/derived/app-page-container";
import { ConfirmationDialog } from "@/components/derived/confirmation-dialog";

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

  const loggedInAdminQuery = useLoggedInAdminQuery();
  const loggedInAdmin = loggedInAdminQuery.data?.data;

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
    <>
      {loggedInAdmin?.role === "super_admin" && (
        <Link
          to="/admins/create"
          className="fixed z-10 flex items-center justify-center p-3 rounded-full bottom-4 right-4 bg-haptic-brand-600 shadow-haptic-brand-900 animate-fade-in sm:hidden"
        >
          <Plus className="w-6 h-6 text-white" />
        </Link>
      )}
      <AppPageContainer title={loaderData.pageTitle} className="pb-5">
        <AppPageTitle
          title={loaderData.pageTitle}
          actions={
            loggedInAdmin?.role === "super_admin" && (
              <Button
                as={Link}
                to="/admins/create"
                variant="primary"
                leading={Plus}
                className="hidden sm:inline-flex"
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
          <div className="flex flex-wrap gap-3 sm:items-center">
            <Input
              name="search"
              onChange={(e) => setSearch(e.target.value)}
              value={search ?? ""}
              type="search"
              placeholder="Search by full name or email"
              className="flex-1 min-w-[20rem]"
            />

            <Controller
              control={filtersForm.control}
              name="role"
              render={({ field }) => (
                <Select
                  name={field.name}
                  selectedOption={{
                    label: adminRoleValueToLabel(field.value ?? ""),
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
                      <SelectContent>
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
              className="ml-auto text-red-500"
            >
              Reset
            </Button>
          </div>
        </div>
        <Table
          id="admins"
          loading={adminIndexQuery.isLoading}
          error={adminIndexQuery.isError}
          errorMessage={
            (typeof adminIndexQuery.error === "object" &&
              adminIndexQuery.error instanceof Error &&
              adminIndexQuery.error.message) ||
            undefined
          }
          refetch={adminIndexQuery.refetch}
          headings={["Full Name", "Email", "Role", "Date created"]}
          rows={adminIndexQuery.data?.data.map((admin) => [
            admin.full_name,
            admin.email,
            adminRoleValueToLabel(admin.role),
            formatDateTime(admin.created_at),
            <div className="flex items-center justify-end gap-x-1">
              {loggedInAdmin?.id === admin.id && (
                <IconButton
                  as={Link}
                  to={`/profile`}
                  icon={PencilSimple}
                  label="Edit"
                />
              )}
              {loggedInAdmin?.id !== admin.id &&
                loggedInAdmin?.role === "super_admin" &&
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
            </div>,
          ])}
          className="mt-5"
        />
        {adminIndexQuery.isSuccess && adminIndexQuery.data.data.length > 0 && (
          <div className="mt-5">
            <Controller
              control={filtersForm.control}
              name="page"
              render={({ field }) => (
                <Pagination
                  page={field.value ?? 1}
                  count={adminIndexQuery.data.meta?.pagination?.total ?? 1}
                  pageSize={
                    adminIndexQuery.data.meta?.pagination?.per_page ?? 1
                  }
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
      </AppPageContainer>
    </>
  );
}

type DeactivateAdminDialogProps = {
  adminId: Admin["id"];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

function DeactivateAdminDialog({
  adminId,
  trigger,
  isOpen,
  onOpenChange,
}: DeactivateAdminDialogProps) {
  const deactivateAdminMutation = useDeactivateAdminMutation({ adminId });

  return (
    <ConfirmationDialog
      id="deactivate-admin"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Deactivate Admin"
      description="Are you sure you want to deactivate this admin? After deactivating,
      the admin will not be able to login to the system"
      destructive
      isLoading={deactivateAdminMutation.isLoading}
      isSuccess={deactivateAdminMutation.isSuccess}
      buttonLabel="Deactivate Admin"
      buttonOnClick={() => deactivateAdminMutation.mutate()}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
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
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

function ReactivateAdminDialog({
  adminId,
  trigger,
  isOpen,
  onOpenChange,
}: ReactivateAdminDialogProps) {
  const reactivateAdminMutation = useReactivateAdminMutation({ adminId });

  return (
    <ConfirmationDialog
      id="reactivate-admin"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Reactivate Admin"
      description="Are you sure you want to reactivate this admin? After reactivating
      the admin will be able to login to the system"
      isLoading={reactivateAdminMutation.isLoading}
      isSuccess={reactivateAdminMutation.isSuccess}
      buttonLabel="Reactivate Admin"
      buttonOnClick={() => reactivateAdminMutation.mutate()}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
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
