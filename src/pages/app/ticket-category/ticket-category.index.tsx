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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  TicketCategoryIndexRequestSchema,
  TicketCategoryIndexRequest,
  fetchTicketCategoryIndexQuery,
  useTicketCategoryIndexQuery,
} from "@/queries/ticket.query";
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
import { APIResponseSchema } from "@/schemas/api.schema";
import { TicketCategory, TicketCategorySchema } from "@/schemas/ticket.schema";
import { api } from "@/libs/api.lib";
import { formatDateTime } from "@/utils/date";
import { AppPageContainer } from "@/components/derived/app-page-container";
import { ConfirmationDialog } from "@/components/derived/confirmation-dialog";
import { AppPageResetButton } from "../_components/page-reset-button";
import { AppPageSearchBox } from "../_components/page-search-box";

function loader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const requestData = TicketCategoryIndexRequestSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    );

    fetchTicketCategoryIndexQuery({ queryClient, request: requestData }).catch(
      (err) => {
        console.error(err);
      }
    );

    return loaderResponse({
      pageTitle: "Ticket Categories",
      data: { request: requestData },
    });
  };
}

TicketCategoryIndexPage.loader = loader;

export function TicketCategoryIndexPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;
  const [_, setSearchParams] = useSearchParams();
  const [actionDialogState, setActionDialogState] = React.useState<{
    ticketCategoryId: string | null;
    action: "archive" | "restore" | null;
  }>({
    ticketCategoryId: null,
    action: null,
  });

  const loggedInAdminQuery = useLoggedInAdminQuery();
  const loggedInAdmin = loggedInAdminQuery.data?.data;

  const ticketCategoryQuery = useTicketCategoryIndexQuery(
    loaderData.data.request
  );

  const [search, setSearch] = React.useState<string | null>(null);
  useDebounce(() => {
    if (search === null) return;
    filtersForm.setValue("search", search);
  }, 500);

  const filtersForm = useForm<TicketCategoryIndexRequest>({
    resolver: zodResolver(TicketCategoryIndexRequestSchema),
    defaultValues: loaderData.data.request,
  });

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

  const archiveTicketCategory = React.useCallback(
    (ticketCategoryId: string) => {
      return () =>
        setActionDialogState((prev) => ({
          ...prev,
          ticketCategoryId,
          action: "archive",
        }));
    },
    []
  );

  const restoreTicketCategory = React.useCallback(
    (ticketCategoryId: string) => {
      return () =>
        setActionDialogState((prev) => ({
          ...prev,
          ticketCategoryId,
          action: "restore",
        }));
    },
    []
  );

  return (
    <>
      {loggedInAdmin?.role === "super_admin" && (
        <Link
          to="/ticket-categories/create"
          className="fixed z-10 flex items-center justify-center p-3 rounded-full bottom-4 right-4 bg-haptic-brand-600 shadow-haptic-brand-900 animate-in fade-in sm:hidden"
          data-testid="mobile:link-create-ticket-category"
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
                to="/ticket-categories/create"
                variant="primary"
                leading={Plus}
                className="hidden sm:inline-flex"
                data-testid="link-create-ticket-category"
              >
                New Category
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
              placeholder="Search by name"
            />

            <AppPageResetButton
              to={{
                pathname: "/ticket-categories",
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
          id="ticket-categories"
          loading={ticketCategoryQuery.isLoading}
          error={ticketCategoryQuery.isError}
          errorMessage={
            (typeof ticketCategoryQuery.error === "object" &&
              ticketCategoryQuery.error instanceof Error &&
              ticketCategoryQuery.error.message) ||
            undefined
          }
          refetch={ticketCategoryQuery.refetch}
          headings={["Name", "Date created"]}
          rows={ticketCategoryQuery.data?.data.map((category, index) => [
            category.name,
            formatDateTime(category.created_at),
            <div className="flex items-center justify-end gap-x-1">
              {!category.is_archived ? (
                <>
                  <IconButton
                    as={Link}
                    to={`/ticket-categories/${category.id}`}
                    icon={PencilSimple}
                    label="Edit"
                    data-testid={`link-edit-ticket-category-${index}`}
                  />

                  <IconButton
                    icon={Archive}
                    label="Archive"
                    onClick={archiveTicketCategory(category.id)}
                    className="text-red-600"
                    data-testid={`btn-archive-ticket-category-${index}`}
                  />
                </>
              ) : (
                <IconButton
                  icon={ArrowCounterClockwise}
                  label="Restore"
                  onClick={restoreTicketCategory(category.id)}
                  className="text-green-600"
                  data-testid={`btn-restore-ticket-category-${index}`}
                />
              )}
            </div>,
          ])}
          className="mt-5"
        />
        {ticketCategoryQuery.isSuccess &&
          ticketCategoryQuery.data.data.length > 0 && (
            <div className="mt-5">
              <Controller
                control={filtersForm.control}
                name="page"
                render={({ field }) => (
                  <Pagination
                    page={field.value ?? 1}
                    count={
                      ticketCategoryQuery.data.meta?.pagination?.total ?? 1
                    }
                    pageSize={
                      ticketCategoryQuery.data.meta?.pagination?.per_page ?? 1
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
      <ArchiveTicketCategoryDialog
        key={`archive-${actionDialogState.ticketCategoryId ?? "null"}`}
        ticketCategoryId={actionDialogState.ticketCategoryId ?? ""}
        isOpen={actionDialogState.action === "archive"}
        onOpenChange={(open) => {
          setActionDialogState((prev) => ({
            ticketCategoryId: open ? prev.ticketCategoryId : null,
            action: open ? "archive" : null,
          }));
        }}
      />
      <RestoreTicketCategoryDialog
        key={`restore-${actionDialogState.ticketCategoryId ?? "null"}`}
        ticketCategoryId={actionDialogState.ticketCategoryId ?? ""}
        isOpen={actionDialogState.action === "restore"}
        onOpenChange={(open) => {
          setActionDialogState((prev) => ({
            ticketCategoryId: open ? prev.ticketCategoryId : null,
            action: open ? "restore" : null,
          }));
        }}
      />
    </>
  );
}

type ArchiveTicketCategoryDialogProps = {
  ticketCategoryId: TicketCategory["id"];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

function ArchiveTicketCategoryDialog({
  ticketCategoryId,
  trigger,
  isOpen,
  onOpenChange,
}: ArchiveTicketCategoryDialogProps) {
  const archiveTicketCategoryMutation = useArchiveTicketCategoryMutation({
    ticketCategoryId,
  });

  return (
    <ConfirmationDialog
      id="archive-ticket-category"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Archive Ticket Category"
      description="Are you sure you want to archive this ticket category? After archiving, the
      ticket category will no longer be listed in the ticket category list"
      destructive
      isLoading={archiveTicketCategoryMutation.isLoading}
      isSuccess={archiveTicketCategoryMutation.isSuccess}
      buttonLabel="Archive Category"
      buttonOnClick={() => archiveTicketCategoryMutation.mutate()}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const ArchiveTicketCategoryResponseSchema = APIResponseSchema({
  schema: TicketCategorySchema.pick({
    id: true,
    name: true,
    description: true,
  }),
});

type UseArchiveTicketCategoryMutationParams = {
  ticketCategoryId: TicketCategory["id"];
};

function useArchiveTicketCategoryMutation({
  ticketCategoryId,
}: UseArchiveTicketCategoryMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(
          undefined,
          `/ticket-categories/${ticketCategoryId}/archive`
        );

        return ArchiveTicketCategoryResponseSchema.parse(res);
      } catch (error) {
        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["ticket-category", "index"]);
    },
  });
}

type RestoreTicketCategoryDialogProps = {
  ticketCategoryId: TicketCategory["id"];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

function RestoreTicketCategoryDialog({
  ticketCategoryId,
  trigger,
  isOpen,
  onOpenChange,
}: RestoreTicketCategoryDialogProps) {
  const restoreTicketCategoryMutation = useRestoreTicketCategoryMutation({
    ticketCategoryId: ticketCategoryId,
  });

  return (
    <ConfirmationDialog
      id="restore-ticket-category"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Restore Ticket Category"
      description="Are you sure you want to restore this ticket category? After restoring, the
      ticket category will be listed in the ticket category list"
      isLoading={restoreTicketCategoryMutation.isLoading}
      isSuccess={restoreTicketCategoryMutation.isSuccess}
      buttonLabel="Restore Category"
      buttonOnClick={() => restoreTicketCategoryMutation.mutate()}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const RestoreTicketCategoryResponseSchema = APIResponseSchema({
  schema: TicketCategorySchema.pick({
    id: true,
    name: true,
    description: true,
  }),
});

type UseRestoreTicketCategoryMutationParams = {
  ticketCategoryId: TicketCategory["id"];
};

function useRestoreTicketCategoryMutation({
  ticketCategoryId,
}: UseRestoreTicketCategoryMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(
          undefined,
          `/ticket-categories/${ticketCategoryId}/restore`
        );

        return RestoreTicketCategoryResponseSchema.parse(res);
      } catch (error) {
        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["ticket-category", "index"]);
    },
  });
}
