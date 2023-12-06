import * as React from 'react';
import {
  Archive,
  ArrowCounterClockwise,
  CaretRight,
  PencilSimple,
  Plus,
} from '@phosphor-icons/react';
import { Controller, useForm } from 'react-hook-form';
import qs from 'qs';
import { Button, IconButton } from '@/components/base/button';
import { TabIndicator, TabList, TabTrigger, Tabs } from '@/components/base/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient } from '@tanstack/react-query';
import {
  TicketTagIndexRequestSchema,
  TicketTagIndexRequest,
  fetchTicketTagIndexQuery,
  useTicketTagIndexQuery,
} from '@/queries/ticket.query';
import { Link, LoaderFunctionArgs, useLoaderData, useSearchParams } from 'react-router-dom';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { useDebounce } from '@/hooks/use-debounce';
import { AppPageTitle } from '../_components/page-title.app';
import { Table } from '@/components/base/table';
import { useLoggedInUserQuery } from '@/queries/logged-in-user.query';
import { formatDateTime } from '@/utils/date';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageResetButton } from '../_components/page-reset-button';
import { AppPageSearchBox } from '../_components/page-search-box';
import { RestoreTicketTagDialog } from './_components/restore-ticket-tag-dialog';
import { ArchiveTicketTagDialog } from './_components/archive-ticket-tag-dialog';
import { TablePagination } from '@/components/derived/table-pagination';
import { TicketTag } from '@/schemas/ticket.schema';

function loader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const requestData = TicketTagIndexRequestSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    fetchTicketTagIndexQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Ticket Tags',
      data: { request: requestData },
    });
  };
}

TicketTagIndexPage.loader = loader;

export function TicketTagIndexPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;
  const [_, setSearchParams] = useSearchParams();
  const [actionDialogState, setActionDialogState] = React.useState<
    | {
        ticketTagId: TicketTag['id'];
        ticketTagName: TicketTag['name'];
        action: 'archive' | 'restore';
      }
    | { ticketTagId: null; ticketTagName: null; action: null }
  >({
    ticketTagId: null,
    ticketTagName: null,
    action: null,
  });

  const loggedInUserQuery = useLoggedInUserQuery();
  const loggedInUser = loggedInUserQuery.data?.data;

  const ticketTagQuery = useTicketTagIndexQuery(loaderData.data.request);

  const [search, setSearch] = React.useState<string | null>(null);
  useDebounce(() => {
    if (search === null || filtersForm.getValues('search') === search) {
      return;
    }
    filtersForm.setValue('search', search);
  }, 500);

  const filtersForm = useForm<TicketTagIndexRequest>({
    resolver: zodResolver(TicketTagIndexRequestSchema),
    values: loaderData.data.request,
  });

  filtersForm.watch((data) => {
    const queryStrings = qs.stringify(data);
    const searchParams = new URLSearchParams(queryStrings);

    setSearchParams(searchParams);
  });

  const archiveTicketTag = React.useCallback(
    ({
      ticketTagId,
      ticketTagName,
    }: {
      ticketTagId: TicketTag['id'];
      ticketTagName: TicketTag['name'];
    }) => {
      return () =>
        setActionDialogState((prev) => ({
          ...prev,
          ticketTagId,
          ticketTagName,
          action: 'archive',
        }));
    },
    [],
  );

  const restoreTicketTag = React.useCallback(
    ({
      ticketTagId,
      ticketTagName,
    }: {
      ticketTagId: TicketTag['id'];
      ticketTagName: TicketTag['name'];
    }) => {
      return () =>
        setActionDialogState((prev) => ({
          ...prev,
          ticketTagId,
          ticketTagName,
          action: 'restore',
        }));
    },
    [],
  );

  return (
    <>
      {loggedInUser?.role === 'super_admin' && (
        <Link
          to="/ticket-tags/create"
          className="fixed z-10 flex items-center justify-center p-3 rounded-full bottom-4 right-4 bg-haptic-brand-600 shadow-haptic-brand-900 animate-in fade-in sm:hidden"
        >
          <Plus className="w-6 h-6 text-white" />
        </Link>
      )}
      <AppPageContainer title={loaderData.pageTitle} className="pb-5">
        <AppPageTitle
          title={loaderData.pageTitle}
          actions={
            loggedInUser?.role === 'super_admin' && (
              <Button
                as={Link}
                to="/ticket-tags/create"
                variant="filled"
                severity="primary"
                leading={(props) => <Plus weight="bold" {...props} />}
                className="hidden sm:inline-flex"
              >
                Add Ticket Tag
              </Button>
            )
          }
        />

        <Controller
          control={filtersForm.control}
          name="is_archived"
          render={({ field }) => (
            <Tabs
              value={field.value ?? '0'}
              onValueChange={({ value }) => {
                if (value && (value === '1' || value === '0')) {
                  field.onChange(value);
                  filtersForm.setValue('page', undefined);
                  filtersForm.setValue('search', undefined);
                  setSearch(null);
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
            <AppPageSearchBox
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              value={search ?? ''}
              placeholder="Search by name"
            />

            <AppPageResetButton
              to={{
                pathname: '/ticket-tags',
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
          loading={ticketTagQuery.isLoading}
          error={ticketTagQuery.isError}
          errorMessage={
            (typeof ticketTagQuery.error === 'object' &&
              ticketTagQuery.error instanceof Error &&
              ticketTagQuery.error.message) ||
            undefined
          }
          refetch={ticketTagQuery.refetch}
          headings={['Name', 'Date created']}
          rows={ticketTagQuery.data?.data.map((tag) => [
            tag.name,
            formatDateTime(tag.created_at),
            <div className="flex items-center justify-end gap-x-1">
              {!tag.is_archived ? (
                <>
                  <IconButton
                    as={Link}
                    to={`/ticket-tags/${tag.id}`}
                    label={`Edit ${tag.name}`}
                    tooltip="Edit"
                    icon={(props) => <PencilSimple {...props} />}
                  />

                  <IconButton
                    icon={(props) => <Archive {...props} />}
                    label={`Archive ${tag.name}`}
                    tooltip="Archive"
                    severity="danger"
                    onClick={archiveTicketTag({ ticketTagId: tag.id, ticketTagName: tag.name })}
                  />
                </>
              ) : (
                <>
                  <IconButton
                    as={Link}
                    to={`/ticket-tags/${tag.id}`}
                    label={`View ${tag.name}`}
                    tooltip="View"
                    icon={(props) => <CaretRight {...props} />}
                  />
                  <IconButton
                    severity="primary"
                    label={`Restore ${tag.name}`}
                    tooltip="Restore"
                    icon={(props) => <ArrowCounterClockwise {...props} />}
                    onClick={restoreTicketTag({
                      ticketTagId: tag.id,
                      ticketTagName: tag.name,
                    })}
                  />
                </>
              )}
            </div>,
          ])}
          className="mt-5"
        />
        {ticketTagQuery.isSuccess && ticketTagQuery.data.data.length > 0 && (
          <div className="mt-5">
            <Controller
              control={filtersForm.control}
              name="page"
              render={({ field }) => (
                <TablePagination
                  page={field.value ?? 1}
                  count={ticketTagQuery.data.meta?.pagination?.total ?? 1}
                  pageSize={ticketTagQuery.data.meta?.pagination?.per_page ?? 1}
                  onPageChange={({ page }) => {
                    field.onChange(page);
                  }}
                  className="justify-center"
                />
              )}
            />
          </div>
        )}
      </AppPageContainer>
      <ArchiveTicketTagDialog
        key={`archive-${actionDialogState.ticketTagId ?? 'null'}`}
        ticketTagId={actionDialogState.ticketTagId ?? ''}
        ticketTagName={actionDialogState.ticketTagName ?? ''}
        isOpen={actionDialogState.action === 'archive'}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialogState(() => ({
              ticketTagId: null,
              ticketTagName: null,
              action: null,
            }));
          }
        }}
      />
      <RestoreTicketTagDialog
        key={`restore-${actionDialogState.ticketTagId ?? 'null'}`}
        ticketTagId={actionDialogState.ticketTagId ?? ''}
        ticketTagName={actionDialogState.ticketTagName ?? ''}
        isOpen={actionDialogState.action === 'restore'}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialogState(() => ({
              ticketTagId: null,
              ticketTagName: null,
              action: null,
            }));
          }
        }}
      />
    </>
  );
}
