import * as React from 'react';
import { CaretRight, PencilSimple, Plus, Power } from '@phosphor-icons/react';
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
import { useLoggedInAdminQuery } from '@/queries/logged-in-admin.query';
import { adminRoleValueToLabel } from '@/utils/admin.util';
import {
  AdminIndexRequest,
  AdminIndexRequestSchema,
  fetchAdminIndexQuery,
  useAdminIndexQuery,
} from '@/queries/admin.query';
import { Link, LoaderFunctionArgs, useLoaderData, useSearchParams } from 'react-router-dom';
import { LoaderDataReturn, loaderResponse } from '@/utils/router.util';
import { useDebounce } from '@/hooks/use-debounce';
import { AppPageTitle } from '../_components/page-title.app';
import { Table } from '@/components/base/table';
import { formatDateTime } from '@/utils/date';
import { AppPageContainer } from '@/components/derived/app-page-container';
import { AppPageResetButton } from '../_components/page-reset-button';
import { DeactivateAdminDialog } from './_components/deactivate-admin-dialog';
import { ActivateAdminDialog } from './_components/activate-admin-dialog';
import { AppPageSearchBox } from '../_components/page-search-box';
import { TablePagination } from '@/components/derived/table-pagination';

function loader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const requestData = AdminIndexRequestSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    fetchAdminIndexQuery({ queryClient, request: requestData }).catch((err) => {
      console.error(err);
    });

    return loaderResponse({
      pageTitle: 'Administrators',
      data: { request: requestData },
    });
  };
}

AdminIndexPage.loader = loader;

const adminRoleOptions = [
  { value: '', label: 'All role' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'operator', label: 'Operator' },
];

export function AdminIndexPage() {
  const loaderData = useLoaderData() as LoaderDataReturn<typeof loader>;
  const [_, setSearchParams] = useSearchParams();
  const [actionDialogState, setActionDialogState] = React.useState<{
    adminId: string | null;
    action: 'deactivate' | 'reactivate' | null;
  }>({
    adminId: null,
    action: null,
  });

  const loggedInAdminQuery = useLoggedInAdminQuery();
  const loggedInAdmin = loggedInAdminQuery.data?.data;

  const filtersForm = useForm<AdminIndexRequest>({
    resolver: zodResolver(AdminIndexRequestSchema),
    defaultValues: loaderData.data.request,
  });

  const [search, setSearch] = React.useState<string | null>(null);
  useDebounce(() => {
    if (search === null) return;
    filtersForm.setValue('search', search);
  }, 500);

  const adminIndexQuery = useAdminIndexQuery(loaderData.data.request);

  filtersForm.watch((data, { name }) => {
    if (name === 'is_active') {
      data.search = undefined;
      data.role = undefined;
    }

    if (name !== 'page') {
      data.page = undefined;
    }

    const queryStrings = qs.stringify(data);
    const searchParams = new URLSearchParams(queryStrings);

    setSearchParams(searchParams);
  });

  React.useEffect(() => {
    if (filtersForm.getValues('is_active') !== loaderData.data.request.is_active) {
      filtersForm.setValue('is_active', loaderData.data.request.is_active);
    }
    if (filtersForm.getValues('role') !== loaderData.data.request.role) {
      filtersForm.setValue('role', loaderData.data.request.role);
    }
    if (filtersForm.getValues('search') !== loaderData.data.request.search) {
      filtersForm.setValue('search', loaderData.data.request.search);
    }
    if (filtersForm.getValues('page') !== loaderData.data.request.page) {
      filtersForm.setValue('page', loaderData.data.request.page);
    }
  }, [filtersForm, loaderData.data.request]);

  const deactivateAdmin = React.useCallback((adminId: string) => {
    return () =>
      setActionDialogState((prev) => ({
        ...prev,
        adminId,
        action: 'deactivate',
      }));
  }, []);

  const reactivateAdmin = React.useCallback((adminId: string) => {
    return () =>
      setActionDialogState((prev) => ({
        ...prev,
        adminId,
        action: 'reactivate',
      }));
  }, []);

  return (
    <>
      {loggedInAdmin?.role === 'super_admin' && (
        <Link
          to="/admins/create"
          className="fixed z-10 flex items-center justify-center p-3 rounded-full bottom-4 right-4 bg-haptic-brand-600 shadow-haptic-brand-900 animate-in fade-in sm:hidden"
          data-testid="mobile:link-create-admin"
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
                to="/admins/create"
                variant="filled"
                severity="primary"
                leading={(props) => <Plus weight="bold" {...props} />}
                className="hidden sm:inline-flex"
                data-testid="link-create-admin"
              >
                Add Admin
              </Button>
            )
          }
        />

        <Controller
          control={filtersForm.control}
          name="is_active"
          render={({ field }) => (
            <Tabs
              value={field.value ?? '1'}
              onValueChange={({ value }) => {
                if (value && (value === '1' || value === '0')) {
                  field.onChange(value);
                }
              }}
              className="mt-5"
            >
              <TabList>
                <TabTrigger value="1" data-testid="tab-is_deactivated-active">
                  Active
                </TabTrigger>
                <TabTrigger value="0" data-testid="tab-is_deactivated-deactivated">
                  Deactivated
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
              placeholder="Search by full name or email"
            />

            <Controller
              control={filtersForm.control}
              name="role"
              render={({ field }) => (
                <Select
                  name={field.name}
                  items={adminRoleOptions}
                  onValueChange={(e) => {
                    const value = e?.value[0];

                    if (value === '' || value === 'super_admin' || value === 'operator') {
                      field.onChange(value);
                    }
                  }}
                  value={field.value ? [field.value] : []}
                >
                  <SelectLabel className="sr-only">Role</SelectLabel>
                  <SelectTrigger placeholder="Select role" className="w-48" />
                  <SelectContent>
                    {adminRoleOptions.map((option) => (
                      <SelectOption key={option.value} item={option} />
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <AppPageResetButton
              to={{
                pathname: '/admins',
                search: loaderData.data.request.is_active === '0' ? '?is_active=0' : undefined,
              }}
              onClick={() => setSearch(null)}
              className="ml-auto"
            />
          </div>
        </div>
        <Table
          id="admins"
          loading={adminIndexQuery.isLoading}
          error={adminIndexQuery.isError}
          errorMessage={
            (typeof adminIndexQuery.error === 'object' &&
              adminIndexQuery.error instanceof Error &&
              adminIndexQuery.error.message) ||
            undefined
          }
          refetch={adminIndexQuery.refetch}
          headings={['Full Name', 'Email', 'Role', 'Date created']}
          rows={adminIndexQuery.data?.data.map((admin, index) => [
            admin.full_name,
            admin.email,
            adminRoleValueToLabel(admin.role),
            formatDateTime(admin.created_at),
            <div className="flex items-center justify-end gap-x-1">
              {loggedInAdmin?.id === admin.id && (
                <IconButton
                  as={Link}
                  to={`/profile`}
                  icon={(props) => <PencilSimple {...props} />}
                  tooltip="Edit"
                />
              )}
              {loggedInAdmin?.id !== admin.id &&
                loggedInAdmin?.role === 'super_admin' &&
                (admin.is_active ? (
                  <>
                    <IconButton
                      as={Link}
                      to={`/admins/${admin.id}`}
                      icon={(props) => <PencilSimple {...props} />}
                      tooltip="Edit"
                      data-testid={`link-edit-admin-${index}`}
                    />
                    <IconButton
                      icon={(props) => <Power {...props} />}
                      tooltip="Deactivate"
                      onClick={deactivateAdmin(admin.id)}
                      className="text-red-600"
                      data-testid={`btn-deactivate-admin-${index}`}
                    />
                  </>
                ) : (
                  <>
                    <IconButton
                      as={Link}
                      to={`/admins/${admin.id}`}
                      icon={(props) => <CaretRight {...props} />}
                      tooltip="View"
                      data-testid={`link-view-admin-${index}`}
                    />

                    <IconButton
                      icon={(props) => <Power {...props} />}
                      tooltip="Reactivate"
                      onClick={reactivateAdmin(admin.id)}
                      className="text-brand-600"
                      data-testid={`btn-reactivate-admin-${index}`}
                    />
                  </>
                ))}
            </div>,
          ])}
          className="mt-5"
        />
        {adminIndexQuery.isSuccess && adminIndexQuery.data.data.length > 0 && (
          <div className="mt-5">
            <Controller
              control={filtersForm.control}
              name="page"
              render={({ field }) => (
                <TablePagination
                  page={field.value ?? 1}
                  count={adminIndexQuery.data.meta?.pagination?.total ?? 1}
                  pageSize={adminIndexQuery.data.meta?.pagination?.per_page ?? 1}
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
      <DeactivateAdminDialog
        key={`deactivate-${actionDialogState.adminId ?? 'null'}`}
        adminId={actionDialogState.adminId ?? ''}
        isOpen={actionDialogState.action === 'deactivate'}
        onOpenChange={(open) => {
          setActionDialogState((prev) => ({
            adminId: open ? prev.adminId : null,
            action: open ? 'deactivate' : null,
          }));
        }}
      />
      <ActivateAdminDialog
        key={`reactivate-${actionDialogState.adminId ?? 'null'}`}
        adminId={actionDialogState.adminId ?? ''}
        isOpen={actionDialogState.action === 'reactivate'}
        onOpenChange={(open) =>
          setActionDialogState((prev) => ({
            adminId: open ? prev.adminId : null,
            action: open ? 'reactivate' : null,
          }))
        }
      />
    </>
  );
}
