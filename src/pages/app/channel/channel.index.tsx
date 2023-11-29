import * as React from 'react';
import { Archive, ArrowCounterClockwise, PencilSimple, Plus } from '@phosphor-icons/react';
import { Controller, useForm } from 'react-hook-form';
import qs from 'qs';
import { Button, IconButton } from '@/components/base/button';
import { TabIndicator, TabList, TabTrigger, Tabs } from '@/components/base/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient } from '@tanstack/react-query';
import {
  ChannelIndexRequest,
  ChannelIndexRequestSchema,
  fetchChannelIndexQuery,
  useChannelIndexQuery,
} from '@/queries/channel.query';
import { Link, LoaderFunctionArgs, useLoaderData, useSearchParams } from 'react-router-dom';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { useDebounce } from '@/hooks/use-debounce';
import { AppPageTitle } from '../_components/page-title.app';
import { Table } from '@/components/base/table';
import { useLoggedInUserQuery } from '@/queries/logged-in-user.query';
import { formatDateTime } from '@/utils/date';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { ArchiveChannelDialog } from './_components/archive-channel-dialog';
import { RestoreChannelDialog } from './_components/restore-channel-dialog';
import { AppPageSearchBox } from '../_components/page-search-box';
import { AppPageResetButton } from '../_components/page-reset-button';
import { TablePagination } from '@/components/derived/table-pagination';

function loader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const requestData = ChannelIndexRequestSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    fetchChannelIndexQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Channels',
      data: { request: requestData },
    });
  };
}

ChannelIndexPage.loader = loader;

export function ChannelIndexPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;
  const [_, setSearchParams] = useSearchParams();
  const [actionDialogState, setActionDialogState] = React.useState<
    | {
        channelId: string;
        channelName: string;
        action: 'archive' | 'restore';
      }
    | { channelId: null; channelName: null; action: null }
  >({
    channelId: null,
    channelName: null,
    action: null,
  });

  const loggedInUserQuery = useLoggedInUserQuery();
  const loggedInUser = loggedInUserQuery.data?.data;

  const channelIndexQuery = useChannelIndexQuery(loaderData.data.request);

  const filtersForm = useForm<ChannelIndexRequest>({
    resolver: zodResolver(ChannelIndexRequestSchema),
    values: loaderData.data.request,
  });

  const [search, setSearch] = React.useState<string | null>(
    filtersForm.getValues('search') ?? null,
  );
  useDebounce(() => {
    if (search === null || filtersForm.getValues('search') === search) {
      return;
    }
    filtersForm.setValue('search', search);
  }, 500);

  filtersForm.watch((data) => {
    const queryStrings = qs.stringify(data);
    const searchParams = new URLSearchParams(queryStrings);

    setSearchParams(searchParams);
  });

  const archiveChannel = React.useCallback(
    ({ channelId, channelName }: { channelId: string; channelName: string }) => {
      return () =>
        setActionDialogState((prev) => ({
          ...prev,
          channelId,
          channelName,
          action: 'archive',
        }));
    },
    [],
  );

  const restoreChannel = React.useCallback(
    ({ channelId, channelName }: { channelId: string; channelName: string }) => {
      return () =>
        setActionDialogState((prev) => ({
          ...prev,
          channelId,
          channelName,
          action: 'restore',
        }));
    },
    [],
  );

  return (
    <>
      {loggedInUser?.role === 'super_admin' && (
        <Link
          aria-label="Add Channel"
          to="/channels/create"
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
                to="/channels/create"
                variant="filled"
                severity="primary"
                leading={(props) => <Plus weight="bold" {...props} />}
                className="hidden sm:inline-flex"
              >
                Add Channel
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
                pathname: '/channels',
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
          loading={channelIndexQuery.isLoading}
          error={channelIndexQuery.isError}
          errorMessage={
            (channelIndexQuery.error instanceof Error && channelIndexQuery.error.message) ||
            undefined
          }
          refetch={channelIndexQuery.refetch}
          headings={['Name', 'Date created']}
          rows={channelIndexQuery.data?.data.map((channel) => [
            channel.name,
            formatDateTime(channel.created_at),
            <div className="flex items-center justify-end gap-x-1">
              <IconButton
                as={Link}
                to={`/channels/${channel.id}`}
                icon={(props) => <PencilSimple {...props} />}
                label={`Edit ${channel.name}`}
                tooltip="Edit Channel"
              />
              {loggedInUser?.role === 'super_admin' &&
                (!channel.is_archived ? (
                  <IconButton
                    icon={(props) => <Archive {...props} />}
                    label={`Archive ${channel.name}`}
                    tooltip="Archive channel"
                    onClick={archiveChannel({ channelId: channel.id, channelName: channel.name })}
                    severity="danger"
                  />
                ) : (
                  <IconButton
                    icon={(props) => <ArrowCounterClockwise {...props} />}
                    label={`Restore ${channel.name}`}
                    tooltip="Restore channel"
                    onClick={restoreChannel({ channelId: channel.id, channelName: channel.name })}
                    severity="primary"
                  />
                ))}
            </div>,
          ])}
          className="mt-5"
        />
        {channelIndexQuery.isSuccess && channelIndexQuery.data.data.length > 0 && (
          <div className="mt-5">
            <Controller
              control={filtersForm.control}
              name="page"
              render={({ field }) => (
                <TablePagination
                  page={field.value ?? 1}
                  count={channelIndexQuery.data.meta?.pagination?.total ?? 1}
                  pageSize={channelIndexQuery.data.meta?.pagination?.per_page ?? 1}
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
      <ArchiveChannelDialog
        key={`archive-${actionDialogState.channelId ?? 'null'}`}
        channelId={actionDialogState.channelId ?? ''}
        channelName={actionDialogState.channelName ?? ''}
        isOpen={actionDialogState.action === 'archive'}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialogState(() => ({
              channelId: null,
              channelName: null,
              action: null,
            }));
          }
        }}
      />
      <RestoreChannelDialog
        key={`restore-${actionDialogState.channelId ?? 'null'}`}
        channelId={actionDialogState.channelId ?? ''}
        channelName={actionDialogState.channelName ?? ''}
        isOpen={actionDialogState.action === 'restore'}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialogState(() => ({
              channelId: null,
              channelName: null,
              action: null,
            }));
          }
        }}
      />
    </>
  );
}
