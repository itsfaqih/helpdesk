import * as React from 'react';
import {
  Archive,
  ArrowCounterClockwise,
  ArrowsClockwise,
  CaretRight,
  PencilSimple,
  Plus,
} from '@phosphor-icons/react';
import { Controller, useForm } from 'react-hook-form';
import qs from 'qs';
import { Button, IconButton } from '@/components/base/button';
import {
  Select,
  SelectContent,
  SelectLabel,
  SelectOption,
  SelectTrigger,
} from '@/components/base/select';
import { TabIndicator, TabList, TabTrigger, Tabs } from '@/components/base/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient } from '@tanstack/react-query';
import { useLoggedInUserQuery } from '@/queries/logged-in-user.query';
import { userRoleValueToLabel } from '@/utils/user.util';
import {
  UserIndexRequest,
  UserIndexRequestSchema,
  fetchUserIndexQuery,
  useUserIndexQuery,
} from '@/queries/user.query';
import { Link, LoaderFunctionArgs, useLoaderData, useSearchParams } from 'react-router-dom';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { useDebounce } from '@/hooks/use-debounce';
import { AppPageTitle } from '../_components/page-title.app';
import { Table } from '@/components/base/table';
import { formatDateTime } from '@/utils/date';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageResetButton } from '../_components/page-reset-button';
import { DeactivateUserDialog } from './_components/deactivate-user-dialog';
import { ActivateUserDialog } from './_components/activate-user-dialog';
import { AppPageSearchBox } from '../_components/page-search-box';
import { TablePagination } from '@/components/derived/table-pagination';
import { User } from '@/schemas/user.schema';
import { ArchiveUserDialog } from './_components/archive-user-dialog';
import { RestoreUserDialog } from './_components/restore-user-dialog';
import { ActiveBadge, InactiveBadge } from '@/components/derived/activity-badge';
import { cn } from '@/libs/cn.lib';

function loader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const requestData = UserIndexRequestSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    fetchUserIndexQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Users',
      data: { request: requestData },
    });
  };
}

UserIndexPage.loader = loader;

const userRoleOptions = [
  { value: 'all', label: 'All role' },
  { value: 'super_admin', label: 'Super admin' },
  { value: 'operator', label: 'Operator' },
];

const userStatusOptions = [
  { value: 'all', label: 'All status' },
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
];

export function UserIndexPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;
  const [_, setSearchParams] = useSearchParams();
  const [actionDialogState, setActionDialogState] = React.useState<
    | {
        userId: User['id'];
        userFullName: User['full_name'];
        action: 'deactivate' | 'activate' | 'archive' | 'restore';
      }
    | {
        userId: null;
        userFullName: null;
        action: null;
      }
  >({
    userId: null,
    userFullName: null,
    action: null,
  });

  const loggedInUserQuery = useLoggedInUserQuery();
  const loggedInUser = loggedInUserQuery.data?.data;

  const filtersForm = useForm<UserIndexRequest>({
    resolver: zodResolver(UserIndexRequestSchema),
    values: {
      ...loaderData.data.request,
      is_active: loaderData.data.request.is_active ?? 'all',
      role: loaderData.data.request.role ?? 'all',
    },
  });

  const [search, setSearch] = React.useState<string | null>(null);
  useDebounce(() => {
    if (search === null || filtersForm.getValues('search') === search) {
      return;
    }
    filtersForm.setValue('search', search);
  }, 500);

  const userIndexQuery = useUserIndexQuery(loaderData.data.request);

  filtersForm.watch((data, { name }) => {
    if (name === 'is_archived') {
      data.search = undefined;
      data.role = undefined;
      data.is_active = undefined;
    }

    if (name !== 'page') {
      data.page = undefined;
    }

    if (data.role === 'all') {
      data.role = undefined;
    }

    if (data.is_active === 'all') {
      data.is_active = undefined;
    }

    const queryStrings = qs.stringify(data);
    const searchParams = new URLSearchParams(queryStrings);

    setSearchParams(searchParams);
  });

  const deactivateUser = React.useCallback(
    ({ userId, userFullName }: { userId: User['id']; userFullName: User['full_name'] }) => {
      return () =>
        setActionDialogState((prev) => ({
          ...prev,
          userId,
          userFullName,
          action: 'deactivate',
        }));
    },
    [],
  );

  const activateUser = React.useCallback(
    ({ userId, userFullName }: { userId: User['id']; userFullName: User['full_name'] }) => {
      return () =>
        setActionDialogState((prev) => ({
          ...prev,
          userId,
          userFullName,
          action: 'activate',
        }));
    },
    [],
  );

  const archiveUser = React.useCallback(
    ({ userId, userFullName }: { userId: User['id']; userFullName: User['full_name'] }) => {
      return () =>
        setActionDialogState((prev) => ({
          ...prev,
          userId,
          userFullName,
          action: 'archive',
        }));
    },
    [],
  );

  const restoreUser = React.useCallback(
    ({ userId, userFullName }: { userId: User['id']; userFullName: User['full_name'] }) => {
      return () =>
        setActionDialogState((prev) => ({
          ...prev,
          userId,
          userFullName,
          action: 'restore',
        }));
    },
    [],
  );

  return (
    <>
      {loggedInUser?.role === 'super_admin' && (
        <Link
          to="/users/create"
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
                to="/users/create"
                variant="filled"
                severity="primary"
                leading={(props) => <Plus weight="bold" {...props} />}
                className="hidden sm:inline-flex"
              >
                Add User
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
              placeholder="Search by full name or email"
            />

            <Controller
              control={filtersForm.control}
              name="role"
              render={({ field }) => (
                <Select
                  name={field.name}
                  items={userRoleOptions}
                  onValueChange={(e) => {
                    const value = e?.value[0];

                    if (value === 'all' || value === 'super_admin' || value === 'operator') {
                      field.onChange(value);
                    }
                  }}
                  value={field.value ? [field.value] : []}
                >
                  <SelectLabel className="sr-only">Role</SelectLabel>
                  <SelectTrigger placeholder="Select role" className="w-48" />
                  <SelectContent>
                    {userRoleOptions.map((option) => (
                      <SelectOption key={option.value} item={option} />
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              control={filtersForm.control}
              name="is_active"
              render={({ field }) => (
                <Select
                  name={field.name}
                  items={userStatusOptions}
                  onValueChange={(e) => {
                    const value = e?.value[0];

                    if (value === 'all' || value === '1' || value === '0') {
                      field.onChange(value);
                    }
                  }}
                  value={field.value ? [field.value] : []}
                >
                  <SelectLabel className="sr-only">Status</SelectLabel>
                  <SelectTrigger placeholder="Select status" className="w-48" />
                  <SelectContent>
                    {userStatusOptions.map((option) => (
                      <SelectOption key={option.value} item={option} />
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <AppPageResetButton
              to={{
                pathname: '/users',
                search: loaderData.data.request.is_archived === '1' ? '?is_archived=1' : undefined,
              }}
              onClick={() => setSearch(null)}
              className="ml-auto"
            />
          </div>
        </div>
        <Table
          loading={userIndexQuery.isLoading}
          error={userIndexQuery.isError}
          errorMessage={
            (typeof userIndexQuery.error === 'object' &&
              userIndexQuery.error instanceof Error &&
              userIndexQuery.error.message) ||
            undefined
          }
          refetch={userIndexQuery.refetch}
          headings={['Full Name', 'Email', 'Role', 'Status', 'Date created']}
          rows={userIndexQuery.data?.data.map((user) => [
            user.full_name,
            user.email,
            userRoleValueToLabel(user.role),
            <div className="flex gap-2 items-center">
              {user.is_active ? (
                <>
                  <ActiveBadge />
                  <IconButton
                    type="button"
                    id="status"
                    label="Deactivate"
                    tooltip="Deactivate"
                    disabledTooltip={
                      loggedInUser?.id === user.id
                        ? "You can't deactivate your own account"
                        : "You can't deactivate an archived user"
                    }
                    disabled={loggedInUser?.id === user.id || user.is_archived}
                    icon={({ className, ...props }) => (
                      <ArrowsClockwise
                        className={cn(
                          className,
                          'transition-transform',
                          'group-data-[loading=false]:group-hover:rotate-90',
                          'group-data-[loading=true]:animate-spin',
                        )}
                        {...props}
                      />
                    )}
                    onClick={deactivateUser({ userId: user.id, userFullName: user.full_name })}
                    className="group"
                  />
                </>
              ) : (
                <>
                  <InactiveBadge />
                  <IconButton
                    type="button"
                    id="status"
                    label="Activate"
                    tooltip="Activate"
                    disabledTooltip="You can't activate an archived user"
                    disabled={user.is_archived}
                    icon={({ className, ...props }) => (
                      <ArrowsClockwise
                        className={cn(
                          className,
                          'transition-transform',
                          'group-data-[loading=false]:group-hover:rotate-90',
                          'group-data-[loading=true]:animate-spin',
                        )}
                        {...props}
                      />
                    )}
                    onClick={activateUser({ userId: user.id, userFullName: user.full_name })}
                    className="group"
                  />
                </>
              )}
            </div>,
            formatDateTime(user.created_at),
            <div className="flex items-center justify-end gap-x-1">
              {loggedInUser?.id === user.id && (
                <>
                  <IconButton
                    as={Link}
                    to={`/profile`}
                    icon={(props) => <PencilSimple {...props} />}
                    tooltip="Edit your profile"
                    label="Edit your profile"
                  />

                  <IconButton
                    severity="danger"
                    disabledTooltip="You can't archive your own account"
                    label={`Archive ${user.email}`}
                    icon={(props) => <Archive {...props} />}
                    disabled
                  />
                </>
              )}
              {loggedInUser?.id !== user.id &&
                loggedInUser?.role === 'super_admin' &&
                (user.is_archived ? (
                  <>
                    <IconButton
                      as={Link}
                      to={`/users/${user.id}`}
                      tooltip="View"
                      icon={(props) => <CaretRight {...props} />}
                    />

                    <IconButton
                      severity="primary"
                      tooltip="Restore"
                      label={`Restore ${user.email}`}
                      icon={(props) => <ArrowCounterClockwise {...props} />}
                      onClick={restoreUser({ userId: user.id, userFullName: user.full_name })}
                    />
                  </>
                ) : (
                  <>
                    <IconButton
                      as={Link}
                      to={`/users/${user.id}`}
                      tooltip="Edit"
                      label={`Edit ${user.email}`}
                      icon={(props) => <PencilSimple {...props} />}
                    />
                    <IconButton
                      severity="danger"
                      tooltip="Archive"
                      label={`Archive ${user.email}`}
                      icon={(props) => <Archive {...props} />}
                      onClick={archiveUser({ userId: user.id, userFullName: user.full_name })}
                    />
                  </>
                ))}
            </div>,
          ])}
          className="mt-5"
        />
        {userIndexQuery.isSuccess && userIndexQuery.data.data.length > 0 && (
          <div className="mt-5">
            <Controller
              control={filtersForm.control}
              name="page"
              render={({ field }) => (
                <TablePagination
                  page={field.value ?? 1}
                  count={userIndexQuery.data.meta?.pagination?.total ?? 1}
                  pageSize={userIndexQuery.data.meta?.pagination?.per_page ?? 1}
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
      <DeactivateUserDialog
        key={`deactivate-${actionDialogState.userId ?? 'null'}`}
        userId={actionDialogState.userId ?? ''}
        userFullName={actionDialogState.userFullName ?? ''}
        isOpen={actionDialogState.action === 'deactivate'}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialogState(() => ({
              userId: null,
              userFullName: null,
              action: null,
            }));
          }
        }}
      />
      <ActivateUserDialog
        key={`activate-${actionDialogState.userId ?? 'null'}`}
        userId={actionDialogState.userId ?? ''}
        userFullName={actionDialogState.userFullName ?? ''}
        isOpen={actionDialogState.action === 'activate'}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialogState(() => ({
              userId: null,
              userFullName: null,
              action: null,
            }));
          }
        }}
      />
      <ArchiveUserDialog
        key={`archive-${actionDialogState.userId ?? 'null'}`}
        userId={actionDialogState.userId ?? ''}
        userFullName={actionDialogState.userFullName ?? ''}
        isOpen={actionDialogState.action === 'archive'}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialogState(() => ({
              userId: null,
              userFullName: null,
              action: null,
            }));
          }
        }}
      />
      <RestoreUserDialog
        key={`restore-${actionDialogState.userId ?? 'null'}`}
        userId={actionDialogState.userId ?? ''}
        userFullName={actionDialogState.userFullName ?? ''}
        isOpen={actionDialogState.action === 'restore'}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialogState(() => ({
              userId: null,
              userFullName: null,
              action: null,
            }));
          }
        }}
      />
    </>
  );
}
