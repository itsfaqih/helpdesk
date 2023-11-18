import * as React from 'react';
import { CaretRight } from '@phosphor-icons/react';
import { Controller, useForm } from 'react-hook-form';
import qs from 'qs';
import { IconButton } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { TabIndicator, TabList, TabTrigger, Tabs } from '@/components/base/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient } from '@tanstack/react-query';
import {
  TicketIndexRequest,
  TicketIndexRequestSchema,
  fetchTicketIndexQuery,
  useTicketTagIndexQuery,
  useTicketIndexQuery,
} from '@/queries/ticket.query';
import { Link, LoaderFunctionArgs, useLoaderData, useSearchParams } from 'react-router-dom';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import {
  Pagination,
  PaginationEllipsis,
  PaginationList,
  PaginationListItem,
  PaginationNextPageTrigger,
  PaginationPageTrigger,
  PaginationPrevPageTrigger,
} from '@/components/base/pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { AppPageTitle } from '../_components/page-title.app';
import { Table } from '@/components/base/table';
import { Badge } from '@/components/base/badge';
import { ticketStatusToBadgeColor, ticketStatusToLabel } from '@/utils/ticket.util';
import {
  Select,
  SelectContent,
  SelectLabel,
  SelectOption,
  SelectTrigger,
} from '@/components/base/select';
import { TicketStatusEnum } from '@/schemas/ticket.schema';
import { formatDateTime } from '@/utils/date';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageResetButton } from '../_components/page-reset-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/base/avatar';
import { getInitials } from '@/utils/text.util';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/base/tooltip';

function loader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const requestData = TicketIndexRequestSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    fetchTicketIndexQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Tickets',
      data: { request: requestData },
    });
  };
}

TicketIndexPage.loader = loader;

const ticketStatusOptions = [
  {
    label: 'All status',
    value: 'all',
  },
  ...TicketStatusEnum.options.map((status) => ({
    label: ticketStatusToLabel(status),
    value: status,
  })),
];

export function TicketIndexPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;
  const [_, setSearchParams] = useSearchParams();

  const [search, setSearch] = React.useState<string | null>(null);
  useDebounce(() => {
    if (search === null) return;
    filtersForm.setValue('search', search);
  }, 500);

  const ticketIndexQuery = useTicketIndexQuery(loaderData.data.request);

  const filtersForm = useForm<TicketIndexRequest>({
    resolver: zodResolver(TicketIndexRequestSchema),
    defaultValues: {
      ...loaderData.data.request,
      status: loaderData.data.request.status ?? 'all',
      tag_id: loaderData.data.request.tag_id ?? 'all',
    },
  });

  filtersForm.watch((data, { name }) => {
    if (name === 'is_archived') {
      data.search = undefined;
    }

    if (name !== 'page') {
      data.page = undefined;
    }

    if (data.status === 'all') {
      data.status = undefined;
    }

    if (data.tag_id === 'all') {
      data.tag_id = undefined;
    }

    const queryStrings = qs.stringify(data);
    const searchParams = new URLSearchParams(queryStrings);

    setSearchParams(searchParams);
  });

  React.useEffect(() => {
    if (filtersForm.getValues('is_archived') !== loaderData.data.request.is_archived) {
      filtersForm.setValue('is_archived', loaderData.data.request.is_archived);
    }
    if (filtersForm.getValues('search') !== loaderData.data.request.search) {
      filtersForm.setValue('search', loaderData.data.request.search);
    }
    if (filtersForm.getValues('page') !== loaderData.data.request.page) {
      filtersForm.setValue('page', loaderData.data.request.page);
    }
  }, [filtersForm, loaderData.data.request]);

  const ticketTagIndexQuery = useTicketTagIndexQuery({});

  const ticketTagOptions = [
    {
      label: 'All tag',
      value: 'all',
    },
    ...(ticketTagIndexQuery.data?.data.map((tag) => ({
      label: tag.name,
      value: tag.id,
    })) ?? []),
  ];

  return (
    <AppPageContainer title={loaderData.pageTitle} className="pb-5">
      <AppPageTitle title={loaderData.pageTitle} />

      <Controller
        control={filtersForm.control}
        name="is_archived"
        render={({ field }) => (
          <Tabs
            value={field.value ?? '0'}
            onChange={({ value }) => {
              if (value && (value === '1' || value === '0')) {
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
            value={search ?? ''}
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
                items={ticketStatusOptions}
                value={field.value ? [field.value] : undefined}
                onChange={(e) => {
                  const value = e?.value[0];

                  if (
                    value === 'all' ||
                    value === 'open' ||
                    value === 'in_progress' ||
                    value === 'resolved' ||
                    value === 'unresolved'
                  ) {
                    field.onChange(value);
                  }
                }}
              >
                <SelectLabel className="sr-only">Status</SelectLabel>
                <SelectTrigger placeholder="Select status" className="w-48" />
                <SelectContent>
                  {ticketStatusOptions.map((option) => (
                    <SelectOption key={option.value} item={option} />
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <Controller
            control={filtersForm.control}
            name="tag_id"
            render={({ field }) => (
              <Select
                name={field.name}
                items={ticketTagOptions}
                value={field.value ? [field.value] : undefined}
                onChange={(e) => {
                  const value = e?.value[0];

                  field.onChange(value);
                }}
              >
                <SelectLabel className="sr-only">tag</SelectLabel>
                <SelectTrigger placeholder="Select tag" className="w-48" />
                <SelectContent>
                  {ticketTagOptions.map((option) => (
                    <SelectOption key={option.value} item={option} />
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <AppPageResetButton
            to={{
              pathname: '/tickets',
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
        id="tickets"
        loading={ticketIndexQuery.isLoading}
        error={ticketIndexQuery.isError}
        errorMessage={
          (typeof ticketIndexQuery.error === 'object' &&
            ticketIndexQuery.error instanceof Error &&
            ticketIndexQuery.error.message) ||
          undefined
        }
        refetch={ticketIndexQuery.refetch}
        headings={['Title', 'Client', 'tag', 'Assignees', 'Status', 'Last updated']}
        rows={ticketIndexQuery.data?.data.map((ticket) => [
          ticket.title,
          ticket.client.full_name,
          ticket.tags.map((tag) => tag.name).join(', '),
          <div className="flex items-center justify-start -space-x-2">
            {ticket.assignments.length === 0 && <span className="text-gray-500">-</span>}
            {ticket.assignments.map((assignment) => (
              <Tooltip key={assignment.id} positioning={{ placement: 'top' }}>
                <TooltipTrigger className="cursor-default">
                  <Avatar className="w-8 h-8 hover:relative">
                    <AvatarImage src={undefined} />
                    <AvatarFallback>
                      {assignment.admin.full_name ? getInitials(assignment.admin.full_name) : ''}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{assignment.admin.full_name}</TooltipContent>
              </Tooltip>
            ))}
          </div>,
          <Badge color={ticketStatusToBadgeColor(ticket.status)}>
            {ticketStatusToLabel(ticket.status)}
          </Badge>,
          formatDateTime(ticket.updated_at),
          <div className="flex items-center justify-end gap-x-1">
            <IconButton
              as={Link}
              to={`/tickets/${ticket.id}`}
              icon={(props) => <CaretRight {...props} />}
              label="View"
            />
          </div>,
        ])}
        className="mt-5"
      />
      {ticketIndexQuery.isSuccess && ticketIndexQuery.data.data.length > 0 && (
        <div className="mt-5">
          <Controller
            control={filtersForm.control}
            name="page"
            render={({ field }) => (
              <Pagination
                page={field.value ?? 1}
                count={ticketIndexQuery.data.meta?.pagination?.total ?? 1}
                pageSize={ticketIndexQuery.data.meta?.pagination?.per_page ?? 1}
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
                    {(pages as { type: 'page'; value: number }[]).map((page, index) =>
                      page.type === 'page' ? (
                        <PaginationListItem key={index}>
                          <PaginationPageTrigger {...page}>{page.value}</PaginationPageTrigger>
                        </PaginationListItem>
                      ) : (
                        <PaginationListItem key={index}>
                          <PaginationEllipsis index={index}>&#8230;</PaginationEllipsis>
                        </PaginationListItem>
                      ),
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
  );
}
