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
import { Input } from "@/components/base/input";
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
import { FadeInContainer } from "@/components/base/fade-in-container";
import { useDebounce } from "@/hooks/use-debounce";
import { AppPageTitle } from "../_components/page-title.app";
import { Table } from "@/components/base/table";
import { useCurrentAdminQuery } from "@/queries/current-admin.query";
import { APIResponseSchema } from "@/schemas/api.schema";
import { TicketCategory, TicketCategorySchema } from "@/schemas/ticket.schema";
import { api } from "@/libs/api.lib";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/base/dialog";

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

  const currentAdminQuery = useCurrentAdminQuery();
  const currentAdmin = currentAdminQuery.data?.data;

  const [search, setSearch] = React.useState<string | null>(null);
  useDebounce(() => {
    if (search === null) return;
    filtersForm.setValue("search", search);
  }, 500);

  const ticketCategoryQuery = useTicketCategoryIndexQuery(
    loaderData.data.request
  );

  const filtersForm = useForm<TicketCategoryIndexRequest>({
    resolver: zodResolver(TicketCategoryIndexRequestSchema),
    defaultValues: loaderData.data.request,
  });

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
          to="/ticket-categories/create"
          className="fixed z-10 flex items-center justify-center p-3 rounded-full bottom-4 right-4 bg-haptic-brand-600 shadow-haptic-brand-900 animate-fade-in sm:hidden"
        >
          <Plus className="w-6 h-6 text-white" />
        </Link>
      )}
      <FadeInContainer className="pb-5">
        <AppPageTitle
          title={loaderData.pageTitle}
          actions={
            currentAdmin?.role === "super_admin" && (
              <Button
                as={Link}
                to="/ticket-categories/create"
                variant="primary"
                leading={Plus}
                className="hidden sm:inline-flex"
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
              placeholder="Search by title"
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
          rows={ticketCategoryQuery.data?.data.map((category) => [
            category.name,
            category.created_at,
            <div className="flex items-center justify-end gap-x-1">
              {!category.is_archived ? (
                <>
                  <IconButton
                    as={Link}
                    to={`/ticket-categories/${category.id}`}
                    icon={PencilSimple}
                    label="Edit"
                  />

                  <ArchiveClientDialog
                    ticketCategoryId={category.id}
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
                <RestoreTicketCategoryDialog
                  ticketCategoryId={category.id}
                  trigger={
                    <IconButton
                      icon={ArrowCounterClockwise}
                      label="Restore"
                      className="text-green-600"
                    />
                  }
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
      </FadeInContainer>
    </>
  );
}

type ArchiveTicketCategoryDialogProps = {
  ticketCategoryId: TicketCategory["id"];
  trigger: React.ReactNode;
};

function ArchiveClientDialog({
  ticketCategoryId,
  trigger,
}: ArchiveTicketCategoryDialogProps) {
  const [open, setOpen] = React.useState(false);

  const archiveTicketCategoryMutation = useArchiveTicketCategoryMutation({
    ticketCategoryId: ticketCategoryId,
  });

  React.useEffect(() => {
    if (archiveTicketCategoryMutation.isSuccess) {
      setOpen(false);
    }
  }, [archiveTicketCategoryMutation.isSuccess]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[36rem]">
        <DialogHeader>
          <DialogTitle>Archive Ticket Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to archive this ticket category? After
            archiving, the ticket category will no longer be listed in the
            ticket category list
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5">
          <Button
            type="button"
            variant="danger"
            loading={archiveTicketCategoryMutation.isLoading}
            success={archiveTicketCategoryMutation.isSuccess}
            onClick={() => archiveTicketCategoryMutation.mutate()}
          >
            Archive Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  trigger: React.ReactNode;
};

function RestoreTicketCategoryDialog({
  ticketCategoryId,
  trigger,
}: RestoreTicketCategoryDialogProps) {
  const [open, setOpen] = React.useState(false);

  const restoreTicketCategoryMutation = useRestoreTicketCategoryMutation({
    ticketCategoryId: ticketCategoryId,
  });

  React.useEffect(() => {
    if (restoreTicketCategoryMutation.isSuccess) {
      setOpen(false);
    }
  }, [restoreTicketCategoryMutation.isSuccess]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[36rem]">
        <DialogHeader>
          <DialogTitle>Restore Ticket Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to restore this ticket category? After
            restoring the ticket category will be listed in the ticket category
            list
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5">
          <Button
            type="button"
            variant="primary"
            loading={restoreTicketCategoryMutation.isLoading}
            success={restoreTicketCategoryMutation.isSuccess}
            onClick={() => restoreTicketCategoryMutation.mutate()}
          >
            Restore Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
