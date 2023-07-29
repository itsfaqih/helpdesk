import React from "react";
import {
  Archive,
  ArrowCounterClockwise,
  CaretRight,
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
import { QueryClient } from "@tanstack/react-query";
import {
  ChannelIndexRequest,
  ChannelIndexRequestSchema,
  fetchChannelIndexQuery,
  useChannelIndexQuery,
} from "@/queries/channel.query";
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
import { ArchiveChannelDialog } from "./_components/archive-channel-dialog";
import { RestoreChannelDialog } from "./_components/restore-channel-dialog";

function loader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const requestData = ChannelIndexRequestSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    );

    fetchChannelIndexQuery({ queryClient, request: requestData }).catch(
      (err) => {
        console.error(err);
      }
    );

    return loaderResponse({
      pageTitle: "Channel",
      data: { request: requestData },
    });
  };
}

ChannelIndexPage.loader = loader;

export function ChannelIndexPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;
  const [_, setSearchParams] = useSearchParams();
  const [actionDialogState, setActionDialogState] = React.useState<{
    channelId: string | null;
    action: "archive" | "restore" | null;
  }>({
    channelId: null,
    action: null,
  });

  const loggedInAdminQuery = useLoggedInAdminQuery();
  const loggedInAdmin = loggedInAdminQuery.data?.data;

  const filtersForm = useForm<ChannelIndexRequest>({
    resolver: zodResolver(ChannelIndexRequestSchema),
    defaultValues: loaderData.data.request,
  });

  const [search, setSearch] = React.useState<string | null>(null);
  useDebounce(() => {
    if (search === null) return;
    filtersForm.setValue("search", search);
  }, 500);

  const channelIndexQuery = useChannelIndexQuery(loaderData.data.request);

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

  const archiveChannel = React.useCallback((channelId: string) => {
    return () =>
      setActionDialogState((prev) => ({
        ...prev,
        channelId,
        action: "archive",
      }));
  }, []);

  const restoreChannel = React.useCallback((channelId: string) => {
    return () =>
      setActionDialogState((prev) => ({
        ...prev,
        channelId,
        action: "restore",
      }));
  }, []);

  return (
    <>
      {loggedInAdmin?.role === "super_admin" && (
        <Link
          to="/channels/create"
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
                to="/channels/create"
                variant="primary"
                leading={Plus}
                className="hidden sm:inline-flex"
              >
                New Channel
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
              placeholder="Search by name"
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
          id="channels"
          loading={channelIndexQuery.isLoading}
          error={channelIndexQuery.isError}
          errorMessage={
            (typeof channelIndexQuery.error === "object" &&
              channelIndexQuery.error instanceof Error &&
              channelIndexQuery.error.message) ||
            undefined
          }
          refetch={channelIndexQuery.refetch}
          headings={["Name", "Date created"]}
          rows={channelIndexQuery.data?.data.map((channel) => [
            channel.name,
            formatDateTime(channel.created_at),
            <div className="flex items-center justify-end gap-x-1">
              <IconButton
                as={Link}
                to={`/channels/${channel.id}`}
                icon={CaretRight}
                label="View"
              />
              {loggedInAdmin?.role === "super_admin" &&
                (!channel.is_archived ? (
                  <IconButton
                    icon={Archive}
                    label="Archive"
                    onClick={archiveChannel(channel.id)}
                    className="text-red-600"
                  />
                ) : (
                  <IconButton
                    icon={ArrowCounterClockwise}
                    label="Restore"
                    onClick={restoreChannel(channel.id)}
                    className="text-green-600"
                  />
                ))}
            </div>,
          ])}
          className="mt-5"
        />
        {channelIndexQuery.isSuccess &&
          channelIndexQuery.data.data.length > 0 && (
            <div className="mt-5">
              <Controller
                control={filtersForm.control}
                name="page"
                render={({ field }) => (
                  <Pagination
                    page={field.value ?? 1}
                    count={channelIndexQuery.data.meta?.pagination?.total ?? 1}
                    pageSize={
                      channelIndexQuery.data.meta?.pagination?.per_page ?? 1
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
      <ArchiveChannelDialog
        key={`archive-${actionDialogState.channelId ?? "null"}`}
        channelId={actionDialogState.channelId ?? ""}
        isOpen={actionDialogState.action === "archive"}
        onOpenChange={(open) => {
          setActionDialogState((prev) => ({
            channelId: open ? prev.channelId : null,
            action: open ? "archive" : null,
          }));
        }}
      />
      <RestoreChannelDialog
        key={`restore-${actionDialogState.channelId ?? "null"}`}
        channelId={actionDialogState.channelId ?? ""}
        isOpen={actionDialogState.action === "restore"}
        onOpenChange={(open) => {
          setActionDialogState((prev) => ({
            channelId: open ? prev.channelId : null,
            action: open ? "restore" : null,
          }));
        }}
      />
    </>
  );
}
