import * as React from 'react';
import {
  Archive,
  ArrowCounterClockwise,
  DotsThree,
  PencilSimple,
  Plus,
} from '@phosphor-icons/react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import qs from 'qs';
import { Button, IconButton } from '@/components/base/button';
import { TabIndicator, TabList, TabTrigger, Tabs } from '@/components/base/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient } from '@tanstack/react-query';
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
import {
  ActionIndexRequest,
  ActionIndexRequestSchema,
  fetchActionIndexQuery,
  useActionIndexQuery,
} from '@/queries/action.query';
import { ArchiveActionDialog } from './_components/archive-action-dialog';
import { RestoreActionDialog } from './_components/restore-action-dialog';
import { DisabledBadge } from './_components/disabled-badge';
import { EnabledBadge } from './_components/enabled-badge';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/base/menu';
import { TablePagination } from '@/components/derived/table-pagination';

function loader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const requestData = ActionIndexRequestSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    fetchActionIndexQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Action',
      data: { request: requestData },
    });
  };
}

ActionIndexPage.loader = loader;

export function ActionIndexPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;
  const [_, setSearchParams] = useSearchParams();
  const [actionDialogState, setActionDialogState] = React.useState<{
    actionId: string | null;
    action: 'archive' | 'restore' | null;
  }>({
    actionId: null,
    action: null,
  });

  const loggedInAdminQuery = useLoggedInAdminQuery();
  const loggedInAdmin = loggedInAdminQuery.data?.data;

  const actionIndexQuery = useActionIndexQuery(loaderData.data.request);

  const filtersForm = useForm<ActionIndexRequest>({
    resolver: zodResolver(ActionIndexRequestSchema),
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

  const archiveAction = React.useCallback((actionId: string) => {
    return () =>
      setActionDialogState((prev) => ({
        ...prev,
        actionId,
        action: 'archive',
      }));
  }, []);

  const restoreAction = React.useCallback((actionId: string) => {
    return () =>
      setActionDialogState((prev) => ({
        ...prev,
        actionId,
        action: 'restore',
      }));
  }, []);

  return (
    <>
      {loggedInAdmin?.role === 'super_admin' && (
        <Link
          to="/actions/create"
          className="fixed z-10 flex items-center justify-center p-3 rounded-full bottom-4 right-4 bg-haptic-brand-600 shadow-haptic-brand-900 animate-in fade-in sm:hidden"
          data-testid="mobile:link-create-action"
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
                to="/actions/create"
                variant="filled"
                severity="primary"
                leading={(props) => <Plus weight="bold" {...props} />}
                className="hidden sm:inline-flex"
                data-testid="link-create-action"
              >
                Add Action
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
              value={search ?? ''}
              placeholder="Search by name"
            />

            <AppPageResetButton
              to={{
                pathname: '/actions',
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
          id="actions"
          loading={actionIndexQuery.isLoading}
          error={actionIndexQuery.isError}
          errorMessage={
            (typeof actionIndexQuery.error === 'object' &&
              actionIndexQuery.error instanceof Error &&
              actionIndexQuery.error.message) ||
            undefined
          }
          refetch={actionIndexQuery.refetch}
          headings={['Icon', 'Label', 'Status', 'Date created']}
          rows={actionIndexQuery.data?.data.map((action, index) => [
            (action.icon_type === 'emoji' && <em-emoji id={action.icon_value} />) ||
              (action.icon_type === 'image' && <img src={action.icon_value} alt="" />),
            action.label,
            action.is_disabled ? <DisabledBadge /> : <EnabledBadge />,
            formatDateTime(action.created_at),
            <div className="flex items-center justify-end gap-x-1">
              <Menu>
                <MenuTrigger asChild>
                  <IconButton icon={(props) => <DotsThree {...props} />} tooltip="Action" />
                </MenuTrigger>
                <MenuContent>
                  <MenuItem asChild id="edit" data-testid={`link-edit-action-${index}`}>
                    <Link to={`/actions/${action.id}`}>
                      <PencilSimple className="mr-2 w-4 h-4" />
                      Edit
                    </Link>
                  </MenuItem>
                  {loggedInAdmin?.role === 'super_admin' &&
                    (action.is_archived ? (
                      <MenuItem
                        id="restore"
                        onClick={restoreAction(action.id)}
                        data-testid={`btn-archive-action-${index}`}
                      >
                        <ArrowCounterClockwise className="mr-2 w-4 h-4" />
                        Restore
                      </MenuItem>
                    ) : (
                      <MenuItem
                        id="archive"
                        onClick={archiveAction(action.id)}
                        destructive
                        data-testid={`btn-restore-action-${index}`}
                      >
                        <Archive className="mr-2 w-4 h-4" />
                        Archive
                      </MenuItem>
                    ))}
                </MenuContent>
              </Menu>
            </div>,
          ])}
          className="mt-5"
        />
        {actionIndexQuery.isSuccess && actionIndexQuery.data.data.length > 0 && (
          <div className="mt-5">
            <Controller
              control={filtersForm.control}
              name="page"
              render={({ field }) => (
                <TablePagination
                  page={field.value ?? 1}
                  count={actionIndexQuery.data.meta?.pagination?.total ?? 1}
                  pageSize={actionIndexQuery.data.meta?.pagination?.per_page ?? 1}
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
      <ArchiveActionDialog
        key={`archive-${actionDialogState.actionId ?? 'null'}`}
        actionId={actionDialogState.actionId ?? ''}
        isOpen={actionDialogState.action === 'archive'}
        onOpenChange={(open) => {
          setActionDialogState((prev) => ({
            actionId: open ? prev.actionId : null,
            action: open ? 'archive' : null,
          }));
        }}
      />
      <RestoreActionDialog
        key={`restore-${actionDialogState.actionId ?? 'null'}`}
        actionId={actionDialogState.actionId ?? ''}
        isOpen={actionDialogState.action === 'restore'}
        onOpenChange={(open) => {
          setActionDialogState((prev) => ({
            actionId: open ? prev.actionId : null,
            action: open ? 'restore' : null,
          }));
        }}
      />
    </>
  );
}
