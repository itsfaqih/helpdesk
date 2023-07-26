import React from "react";
import { ArrowRight } from "@phosphor-icons/react";
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
  TicketIndexRequest,
  TicketIndexRequestSchema,
  fetchTicketIndexQuery,
  useTicketCategoryIndexQuery,
  useTicketIndexQuery,
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
import { Badge } from "@/components/base/badge";
import {
  ticketStatusToBadgeColor,
  ticketStatusToLabel,
} from "@/utils/ticket.util";
import {
  Select,
  SelectContent,
  SelectLabel,
  SelectOption,
  SelectTrigger,
} from "@/components/base/select";
import { TicketStatusEnum } from "@/schemas/ticket.schema";
import { formatDateTime } from "@/utils/date";
import { AppPageContainer } from "@/components/derived/app-page-container";

function loader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const requestData = TicketIndexRequestSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    );

    fetchTicketIndexQuery({ queryClient, request: requestData }).catch(
      (err) => {
        console.error(err);
      }
    );

    return loaderResponse({
      pageTitle: "Tickets",
      data: { request: requestData },
    });
  };
}

TicketIndexPage.loader = loader;

export function TicketIndexPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;
  const [_, setSearchParams] = useSearchParams();

  const [search, setSearch] = React.useState<string | null>(null);
  useDebounce(() => {
    if (search === null) return;
    filtersForm.setValue("search", search);
  }, 500);

  const ticketIndexQuery = useTicketIndexQuery(loaderData.data.request);

  const filtersForm = useForm<TicketIndexRequest>({
    resolver: zodResolver(TicketIndexRequestSchema),
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

  const ticketCategoryIndexQuery = useTicketCategoryIndexQuery({});
  const ticketCategoryOptions =
    ticketCategoryIndexQuery.data?.data.map((category) => ({
      label: category.name,
      value: category.id,
    })) ?? [];

  return (
    <>
      <AppPageContainer title={loaderData.pageTitle} className="pb-5">
        <AppPageTitle title={loaderData.pageTitle} />

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

            <Controller
              control={filtersForm.control}
              name="status"
              render={({ field }) => (
                <Select
                  name={field.name}
                  selectedOption={{
                    label: ticketStatusToLabel(field.value ?? ""),
                    value: field.value ?? "",
                  }}
                  onChange={(selectedOption) => {
                    const value = selectedOption?.value;

                    if (
                      value === "" ||
                      value === "open" ||
                      value === "in_progress" ||
                      value === "resolved" ||
                      value === "unresolved"
                    ) {
                      field.onChange(value);
                    }
                  }}
                >
                  {({ selectedOption }) => (
                    <>
                      <SelectLabel className="sr-only">Status</SelectLabel>
                      <SelectTrigger className="w-48">
                        {(selectedOption as { label?: string })?.label ??
                          "Select status"}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectOption value="" label="All status" />
                        {TicketStatusEnum.options.map((status) => (
                          <SelectOption
                            key={status}
                            value={status}
                            label={ticketStatusToLabel(status)}
                          />
                        ))}
                      </SelectContent>
                    </>
                  )}
                </Select>
              )}
            />

            <Controller
              control={filtersForm.control}
              name="category_id"
              render={({ field }) => (
                <Select
                  name={field.name}
                  selectedOption={
                    ticketCategoryOptions.find(
                      (option) => option.value === field.value
                    ) ?? { label: "All category", value: "" }
                  }
                  onChange={(selectedOption) => {
                    const value = selectedOption?.value;

                    field.onChange(value);
                  }}
                >
                  {({ selectedOption }) => (
                    <>
                      <SelectLabel className="sr-only">Category</SelectLabel>
                      <SelectTrigger className="w-48">
                        {(selectedOption as { label?: string })?.label ??
                          "Select category"}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectOption value="" label="All category" />
                        {ticketCategoryOptions.map((option) => (
                          <SelectOption
                            key={option.value}
                            value={option.value}
                            label={option.label}
                          />
                        ))}
                      </SelectContent>
                    </>
                  )}
                </Select>
              )}
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
          id="tickets"
          loading={ticketIndexQuery.isLoading}
          error={ticketIndexQuery.isError}
          errorMessage={
            (typeof ticketIndexQuery.error === "object" &&
              ticketIndexQuery.error instanceof Error &&
              ticketIndexQuery.error.message) ||
            undefined
          }
          refetch={ticketIndexQuery.refetch}
          headings={[
            "Title",
            "Client's name",
            "Status",
            "Category",
            "Last updated",
            "Date created",
          ]}
          rows={ticketIndexQuery.data?.data.map((ticket) => [
            ticket.title,
            ticket.client.full_name,
            <Badge color={ticketStatusToBadgeColor(ticket.status)}>
              {ticketStatusToLabel(ticket.status)}
            </Badge>,
            ticket.category.name,
            formatDateTime(ticket.created_at),
            formatDateTime(ticket.updated_at),
            <div className="flex items-center justify-end gap-x-1">
              <IconButton
                as={Link}
                to={`/tickets/${ticket.id}`}
                icon={ArrowRight}
                label="View"
              />
            </div>,
          ])}
          className="mt-5"
        />
        {ticketIndexQuery.isSuccess &&
          ticketIndexQuery.data.data.length > 0 && (
            <div className="mt-5">
              <Controller
                control={filtersForm.control}
                name="page"
                render={({ field }) => (
                  <Pagination
                    page={field.value ?? 1}
                    count={ticketIndexQuery.data.meta?.pagination?.total ?? 1}
                    pageSize={
                      ticketIndexQuery.data.meta?.pagination?.per_page ?? 1
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
