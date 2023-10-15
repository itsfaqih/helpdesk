import { QueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router-dom';

export type LoaderDataReturn<
  LoaderFunction extends (
    queryClient: QueryClient,
  ) => (params: LoaderFunctionArgs) => Promise<unknown>,
> = Awaited<ReturnType<ReturnType<LoaderFunction>>>;

type GetLoaderParams<T extends { pageTitle: string }> = T;

export function loaderResponse<T extends { pageTitle: string }>(params: GetLoaderParams<T>): T {
  return params;
}
