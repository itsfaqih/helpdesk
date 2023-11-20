import * as React from 'react';
import {
  Archive,
  ArrowCounterClockwise,
  CaretRight,
  PencilSimple,
  Plus,
} from '@phosphor-icons/react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import qs from 'qs';
import { Button, IconButton } from '@/components/base/button';
import { TabIndicator, TabList, TabTrigger, Tabs } from '@/components/base/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient } from '@tanstack/react-query';
import {
  ClientIndexRequest,
  ClientIndexRequestSchema,
  fetchClientIndexQuery,
  useClientIndexQuery,
} from '@/queries/client.query';
import { Link, LoaderFunctionArgs, useLoaderData, useSearchParams } from 'react-router-dom';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { useDebounce } from '@/hooks/use-debounce';
import { AppPageTitle } from '../_components/page-title.app';
import { Table } from '@/components/base/table';
import { useLoggedInAdminQuery } from '@/queries/logged-in-admin.query';
import { formatDateTime } from '@/utils/date';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageSearchBox } from '../_components/page-search-box';
import { AppPageResetButton } from '../_components/page-reset-button';
import { RestoreClientDialog } from './_components/restore-client-dialog';
import { ArchiveClientDialog } from './_components/archive-client-dialog';
import { TablePagination } from '@/components/derived/table-pagination';

function loader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const requestData = ClientIndexRequestSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    fetchClientIndexQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Client',
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
    action: 'archive' | 'restore' | null;
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
    filtersForm.getValues('search') ?? null,
  );

  useDebounce(() => {
    if (search === null || filtersForm.getValues('search') === search) {
      return;
    }
    filtersForm.setValue('search', search);
  }, 500);

  const watchedFiltersForm = useWatch({ control: filtersForm.control });

  React.useEffect(() => {
    const queryStrings = qs.stringify(watchedFiltersForm);
    setSearchParams(queryStrings);
  }, [watchedFiltersForm, setSearchParams]);

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

  const archiveClient = React.useCallback((clientId: string) => {
    return () =>
      setActionDialogState((prev) => ({
        ...prev,
        clientId,
        action: 'archive',
      }));
  }, []);

  const restoreClient = React.useCallback((clientId: string) => {
    return () =>
      setActionDialogState((prev) => ({
        ...prev,
        clientId,
        action: 'restore',
      }));
  }, []);

  return (
    <>
      {loggedInAdmin?.role === 'super_admin' && (
        <Link
          to="/clients/create"
          className="fixed z-10 flex items-center justify-center p-3 rounded-full bottom-4 right-4 bg-haptic-brand-600 shadow-haptic-brand-900 animate-in fade-in sm:hidden"
        >
          <Plus className="w-6 h-6 text-white" />
        </Link>
      )}
      <AppPageContainer title={loaderData.pageTitle} className="pb-5">
        <AppPageTitle
          title={loaderData.pageTitle}
          actions={
            loggedInAdmin?.role === 'super_admin' && (
              <Button
                as={Link}
                to="/clients/create"
                variant="filled"
                severity="primary"
                leading={(props) => <Plus weight="bold" {...props} />}
                className="hidden sm:inline-flex"
              >
                Add Client
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
              placeholder="Search by full name"
            />

            <AppPageResetButton
              to={{
                pathname: '/clients',
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
          loading={clientIndexQuery.isLoading}
          error={clientIndexQuery.isError}
          errorMessage={
            (typeof clientIndexQuery.error === 'object' &&
              clientIndexQuery.error instanceof Error &&
              clientIndexQuery.error.message) ||
            undefined
          }
          refetch={clientIndexQuery.refetch}
          headings={['Full Name', 'Date created']}
          rows={clientIndexQuery.data?.data.map((client) => [
            client.full_name,
            formatDateTime(client.created_at),
            <div className="flex items-center justify-end gap-x-1">
              {loggedInAdmin?.role === 'super_admin' &&
                (!client.is_archived ? (
                  <>
                    <IconButton
                      as={Link}
                      to={`/clients/${client.id}`}
                      icon={(props) => <PencilSimple {...props} />}
                      tooltip="Edit"
                    />

                    <IconButton
                      icon={(props) => <Archive {...props} />}
                      tooltip="Archive"
                      onClick={archiveClient(client.id)}
                      className="text-red-600"
                    />
                  </>
                ) : (
                  <>
                    <IconButton
                      as={Link}
                      to={`/clients/${client.id}`}
                      icon={(props) => <CaretRight {...props} />}
                      tooltip="View"
                    />

                    <IconButton
                      icon={(props) => <ArrowCounterClockwise {...props} />}
                      tooltip="Restore"
                      onClick={restoreClient(client.id)}
                      className="text-brand-600"
                    />
                  </>
                ))}
            </div>,
          ])}
          className="mt-5"
        />
        {clientIndexQuery.isSuccess && clientIndexQuery.data.data.length > 0 && (
          <div className="mt-5">
            <Controller
              control={filtersForm.control}
              name="page"
              render={({ field }) => (
                <TablePagination
                  page={field.value ?? 1}
                  count={clientIndexQuery.data.meta?.pagination?.total ?? 1}
                  pageSize={clientIndexQuery.data.meta?.pagination?.per_page ?? 1}
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
      <ArchiveClientDialog
        key={`archive-${actionDialogState.clientId ?? 'null'}`}
        clientId={actionDialogState.clientId ?? ''}
        isOpen={actionDialogState.action === 'archive'}
        onOpenChange={(open) => {
          setActionDialogState((prev) => ({
            clientId: open ? prev.clientId : null,
            action: open ? 'archive' : null,
          }));
        }}
      />
      <RestoreClientDialog
        key={`restore-${actionDialogState.clientId ?? 'null'}`}
        clientId={actionDialogState.clientId ?? ''}
        isOpen={actionDialogState.action === 'restore'}
        onOpenChange={(open) =>
          setActionDialogState((prev) => ({
            clientId: open ? prev.clientId : null,
            action: open ? 'restore' : null,
          }))
        }
      />
    </>
  );
}
