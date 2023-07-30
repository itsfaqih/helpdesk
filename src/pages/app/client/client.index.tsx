import React from "react";
import {
  Archive,
  ArrowCounterClockwise,
  PencilSimple,
  Plus,
} from "@phosphor-icons/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import qs from "qs";
import { Button, IconButton } from "@/components/base/button";
import {
  TabIndicator,
  TabList,
  TabTrigger,
  Tabs,
} from "@/components/base/tabs";
import { Client, ClientSchema } from "@/schemas/client.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/libs/api.lib";
import { APIResponseSchema } from "@/schemas/api.schema";
import {
  ClientIndexRequest,
  ClientIndexRequestSchema,
  fetchClientIndexQuery,
  useClientIndexQuery,
} from "@/queries/client.query";
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
import { useLoggedInAdminQuery } from "@/queries/logged-in-admin.query";
import { formatDateTime } from "@/utils/date";
import { AppPageContainer } from "@/components/derived/app-page-container";
import { ConfirmationDialog } from "@/components/derived/confirmation-dialog";
import { AppPageSearchBox } from "../_components/page-search-box";
import { AppPageResetButton } from "../_components/page-reset-button";

function loader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const requestData = ClientIndexRequestSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    );

    fetchClientIndexQuery({ queryClient, request: requestData }).catch(
      (err) => {
        console.error(err);
      }
    );

    return loaderResponse({
      pageTitle: "Client",
      data: { request: requestData },
    });
  };
}

ClientIndexPage.loader = loader;

export function ClientIndexPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;
  const [_, setSearchParams] = useSearchParams();
  const [actionDialogState, setActionDialogState] = React.useState<{
    clientId: string | null;
    action: "archive" | "restore" | null;
  }>({
    clientId: null,
    action: null,
  });

  const loggedInAdminQuery = useLoggedInAdminQuery();
  const loggedInAdmin = loggedInAdminQuery.data?.data;

  const clientIndexQuery = useClientIndexQuery(loaderData.data.request);

  const filtersForm = useForm<ClientIndexRequest>({
    resolver: zodResolver(ClientIndexRequestSchema),
    defaultValues: loaderData.data.request,
  });

  const [search, setSearch] = React.useState<string | null>(
    filtersForm.getValues("search") ?? null
  );

  useDebounce(() => {
    if (search === null || filtersForm.getValues("search") === search) {
      return;
    }
    filtersForm.setValue("search", search);
  }, 500);

  const watchedFiltersForm = useWatch({ control: filtersForm.control });

  React.useEffect(() => {
    const queryStrings = qs.stringify(watchedFiltersForm);
    setSearchParams(queryStrings);
  }, [watchedFiltersForm, setSearchParams]);

  React.useEffect(() => {
    if (
      filtersForm.getValues("is_archived") !==
      loaderData.data.request.is_archived
    ) {
      filtersForm.setValue("is_archived", loaderData.data.request.is_archived);
    }
    if (filtersForm.getValues("search") !== loaderData.data.request.search) {
      filtersForm.setValue("search", loaderData.data.request.search);
    }
    if (filtersForm.getValues("page") !== loaderData.data.request.page) {
      filtersForm.setValue("page", loaderData.data.request.page);
    }
  }, [filtersForm, loaderData.data.request]);

  const archiveClient = React.useCallback((clientId: string) => {
    return () =>
      setActionDialogState((prev) => ({
        ...prev,
        clientId,
        action: "archive",
      }));
  }, []);

  const restoreClient = React.useCallback((clientId: string) => {
    return () =>
      setActionDialogState((prev) => ({
        ...prev,
        clientId,
        action: "restore",
      }));
  }, []);

  return (
    <>
      {loggedInAdmin?.role === "super_admin" && (
        <Link
          to="/clients/create"
          className="fixed z-10 flex items-center justify-center p-3 rounded-full bottom-4 right-4 bg-haptic-brand-600 shadow-haptic-brand-900 animate-in fade-in sm:hidden"
          data-testid="mobile:link-create-client"
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
                to="/clients/create"
                variant="primary"
                leading={Plus}
                className="hidden sm:inline-flex"
                data-testid="link-create-client"
              >
                New Client
              </Button>
            )
          }
        />

        <Controller
          control={filtersForm.control}
          name="is_archived"
          render={({ field }) => (
            <Tabs
              value={field.value ?? "0"}
              onChange={({ value }) => {
                if (value && (value === "1" || value === "0")) {
                  field.onChange(value);
                  filtersForm.setValue("page", undefined);
                  filtersForm.setValue("search", undefined);
                  setSearch(null);
                }
              }}
              className="mt-5"
            >
              <TabList>
                <TabTrigger value="0" data-testid="tab-is_archived-available">
                  Available
                </TabTrigger>
                <TabTrigger value="1" data-testid="tab-is_archived-archived">
                  Archived
                </TabTrigger>
                <TabIndicator />
              </TabList>
            </Tabs>
          )}
        />
        <div className="mt-5">
          <div className="flex flex-wrap gap-3 sm:items-center">
            <AppPageSearchBox
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              value={search ?? ""}
              placeholder="Search by full name"
            />

            <AppPageResetButton
              to={{
                pathname: "/clients",
                search: loaderData.data.request.is_archived
                  ? `is_archived=${loaderData.data.request.is_archived}`
                  : undefined,
              }}
              onClick={() => setSearch(null)}
              className="ml-auto"
            />
          </div>
        </div>
        <Table
          id="clients"
          loading={clientIndexQuery.isLoading}
          error={clientIndexQuery.isError}
          errorMessage={
            (typeof clientIndexQuery.error === "object" &&
              clientIndexQuery.error instanceof Error &&
              clientIndexQuery.error.message) ||
            undefined
          }
          refetch={clientIndexQuery.refetch}
          headings={["Full Name", "Date created"]}
          rows={clientIndexQuery.data?.data.map((client, index) => [
            client.full_name,
            formatDateTime(client.created_at),
            <div className="flex items-center justify-end gap-x-1">
              {loggedInAdmin?.role === "super_admin" &&
                (!client.is_archived ? (
                  <>
                    <IconButton
                      as={Link}
                      to={`/clients/${client.id}`}
                      icon={PencilSimple}
                      label="Edit"
                      data-testid={`link-edit-client-${index}`}
                    />

                    <IconButton
                      icon={Archive}
                      label="Archive"
                      onClick={archiveClient(client.id)}
                      className="text-red-600"
                      data-testid={`btn-archive-client-${index}`}
                    />
                  </>
                ) : (
                  <IconButton
                    icon={ArrowCounterClockwise}
                    label="Restore"
                    onClick={restoreClient(client.id)}
                    className="text-green-600"
                    data-testid={`btn-restore-client-${index}`}
                  />
                ))}
            </div>,
          ])}
          className="mt-5"
        />
        {clientIndexQuery.isSuccess &&
          clientIndexQuery.data.data.length > 0 && (
            <div className="mt-5">
              <Controller
                control={filtersForm.control}
                name="page"
                render={({ field }) => (
                  <Pagination
                    page={field.value ?? 1}
                    count={clientIndexQuery.data.meta?.pagination?.total ?? 1}
                    pageSize={
                      clientIndexQuery.data.meta?.pagination?.per_page ?? 1
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
      <ArchiveClientDialog
        key={`archive-${actionDialogState.clientId ?? "null"}`}
        clientId={actionDialogState.clientId ?? ""}
        isOpen={actionDialogState.action === "archive"}
        onOpenChange={(open) => {
          setActionDialogState((prev) => ({
            clientId: open ? prev.clientId : null,
            action: open ? "archive" : null,
          }));
        }}
      />
      <RestoreClientDialog
        key={`restore-${actionDialogState.clientId ?? "null"}`}
        clientId={actionDialogState.clientId ?? ""}
        isOpen={actionDialogState.action === "restore"}
        onOpenChange={(open) =>
          setActionDialogState((prev) => ({
            clientId: open ? prev.clientId : null,
            action: open ? "restore" : null,
          }))
        }
      />
    </>
  );
}

type ArchiveClientDialogProps = {
  clientId: Client["id"];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

function ArchiveClientDialog({
  clientId,
  trigger,
  isOpen,
  onOpenChange,
}: ArchiveClientDialogProps) {
  const archiveClientMutation = useArchiveClientMutation({ clientId });

  return (
    <ConfirmationDialog
      id="archive-client"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Archive Client"
      description="Are you sure you want to archive this client? After archiving, the
      client will not be listed in the client list"
      destructive
      isLoading={archiveClientMutation.isLoading}
      isSuccess={archiveClientMutation.isSuccess}
      buttonLabel="Archive Client"
      buttonOnClick={() => archiveClientMutation.mutate()}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const ArchiveClientResponseSchema = APIResponseSchema({
  schema: ClientSchema.pick({
    id: true,
    full_name: true,
  }),
});

type UseArchiveClientMutationParams = {
  clientId: Client["id"];
};

function useArchiveClientMutation({
  clientId,
}: UseArchiveClientMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/clients/${clientId}/archive`);

        return ArchiveClientResponseSchema.parse(res);
      } catch (error) {
        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["client", "index"]);
    },
  });
}

type RestoreClientDialogProps = {
  clientId: Client["id"];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

function RestoreClientDialog({
  clientId,
  trigger,
  isOpen,
  onOpenChange,
}: RestoreClientDialogProps) {
  const restoreClientMutation = useRestoreClientMutation({ clientId });

  return (
    <ConfirmationDialog
      id="restore-client"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Restore Client"
      description="Are you sure you want to restore this client? After archiving, the
      client will be listed in the client list"
      isLoading={restoreClientMutation.isLoading}
      isSuccess={restoreClientMutation.isSuccess}
      buttonLabel="Restore Client"
      buttonOnClick={() => restoreClientMutation.mutate()}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const RestoreClientResponseSchema = APIResponseSchema({
  schema: ClientSchema.pick({
    id: true,
    full_name: true,
  }),
});

type UseRestoreClientMutationParams = {
  clientId: Client["id"];
};

function useRestoreClientMutation({
  clientId,
}: UseRestoreClientMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/clients/${clientId}/restore`);

        return RestoreClientResponseSchema.parse(res);
      } catch (error) {
        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["client", "index"]);
    },
  });
}
