import React from "react";
import {
  Archive,
  ArrowCounterClockwise,
  PencilSimple,
  Plus,
} from "@phosphor-icons/react";
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
import { useCurrentAdminQuery } from "@/queries/current-admin.query";
import { formatDateTime } from "@/utils/date";
import { AppPageContainer } from "@/components/derived/app-page-container";

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

  const currentAdminQuery = useCurrentAdminQuery();
  const currentAdmin = currentAdminQuery.data?.data;

  const filtersForm = useForm<ClientIndexRequest>({
    resolver: zodResolver(ClientIndexRequestSchema),
    defaultValues: loaderData.data.request,
  });

  const [search, setSearch] = React.useState<string | null>(null);
  useDebounce(() => {
    if (search === null) return;
    filtersForm.setValue("search", search);
  }, 500);

  const clientIndexQuery = useClientIndexQuery(loaderData.data.request);

  filtersForm.watch((data, { name }) => {
    if (name === "is_archived") {
      data.search = undefined;
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

  return (
    <>
      {currentAdmin?.role === "super_admin" && (
        <Link
          to="/clients/create"
          className="fixed z-10 flex items-center justify-center p-3 rounded-full bottom-4 right-4 bg-haptic-brand-600 shadow-haptic-brand-900 animate-fade-in sm:hidden"
        >
          <Plus className="w-6 h-6 text-white" />
        </Link>
      )}
      <AppPageContainer title={loaderData.pageTitle} className="pb-5">
        <AppPageTitle
          title={loaderData.pageTitle}
          actions={
            currentAdmin?.role === "super_admin" && (
              <Button
                as={Link}
                to="/clients/create"
                variant="primary"
                leading={Plus}
                className="hidden sm:inline-flex"
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
                }
              }}
              className="mt-5"
            >
              <TabList>
                <TabTrigger value="0">Available</TabTrigger>
                <TabTrigger value="1">Archived</TabTrigger>
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
              placeholder="Search by full name"
              className="flex-1 min-w-[20rem]"
            />

            <Button
              onClick={() =>
                filtersForm.reset({
                  is_archived: loaderData.data.request.is_archived,
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
          rows={clientIndexQuery.data?.data.map((client) => [
            client.full_name,
            formatDateTime(client.created_at),
            <div className="flex items-center justify-end gap-x-1">
              {currentAdmin?.role === "super_admin" &&
                (!client.is_archived ? (
                  <>
                    <IconButton
                      as={Link}
                      to={`/clients/${client.id}`}
                      icon={PencilSimple}
                      label="Edit"
                    />

                    <ArchiveClientDialog
                      clientId={client.id}
                      trigger={
                        <IconButton
                          icon={Archive}
                          label="Archive"
                          className="text-red-600"
                        />
                      }
                    />
                  </>
                ) : (
                  <RestoreClientDialog
                    clientId={client.id}
                    trigger={
                      <IconButton
                        icon={ArrowCounterClockwise}
                        label="Restore"
                        className="text-green-600"
                      />
                    }
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
    </>
  );
}

type ArchiveClientDialogProps = {
  clientId: Client["id"];
  trigger: React.ReactNode;
};

function ArchiveClientDialog({ clientId, trigger }: ArchiveClientDialogProps) {
  const [open, setOpen] = React.useState(false);

  const archiveClientMutation = useArchiveClientMutation({ clientId });

  React.useEffect(() => {
    if (archiveClientMutation.isSuccess) {
      setOpen(false);
    }
  }, [archiveClientMutation.isSuccess]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[36rem]">
        <DialogHeader>
          <DialogTitle>Archive Client</DialogTitle>
          <DialogDescription>
            Are you sure you want to archive this client? After archiving, the
            client will not be listed in the client list
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5">
          <Button
            type="button"
            variant="danger"
            loading={archiveClientMutation.isLoading}
            success={archiveClientMutation.isSuccess}
            onClick={() => archiveClientMutation.mutate()}
          >
            Archive Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ArchiveClientResponseSchema = APIResponseSchema({
  schema: ClientSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
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
  trigger: React.ReactNode;
};

function RestoreClientDialog({ clientId, trigger }: RestoreClientDialogProps) {
  const [open, setOpen] = React.useState(false);

  const restoreClientMutation = useRestoreClientMutation({ clientId });

  React.useEffect(() => {
    if (restoreClientMutation.isSuccess) {
      setOpen(false);
    }
  }, [restoreClientMutation.isSuccess]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[36rem]">
        <DialogHeader>
          <DialogTitle>Restore Client</DialogTitle>
          <DialogDescription>
            Are you sure you want to restore this client? After restoring the
            client will be listed in the client list
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5">
          <Button
            type="button"
            variant="primary"
            loading={restoreClientMutation.isLoading}
            success={restoreClientMutation.isSuccess}
            onClick={() => restoreClientMutation.mutate()}
          >
            Restore Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const RestoreClientResponseSchema = APIResponseSchema({
  schema: ClientSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
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
