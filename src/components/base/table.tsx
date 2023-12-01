import * as React from 'react';
import { cn } from '@/libs/cn.lib';
import { Loop } from './loop';
import { Skeleton } from './skeleton';
import { linkClass } from './link';

type TableProps = React.HTMLAttributes<HTMLDivElement> & {
  headings: React.ReactNode[];
  rows?: React.ReactNode[][];
  loading?: boolean;
  error?: boolean;
  refetch?: () => void;
  errorMessage?: string;
};

export function Table({
  headings,
  rows,
  loading,
  error,
  refetch,
  errorMessage = 'Something went wrong when fetching data',
  className,
  ...props
}: TableProps) {
  return (
    <div className={cn('flow-root', className)} {...props}>
      <div className="-mx-6 -my-2 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle px-0 sm:px-6 lg:px-0 2xl:px-6">
          <div className="overflow-hidden shadow-haptic-gray-300 sm:rounded-xl lg:rounded-none 2xl:rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  {headings.map((heading, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="first-of-type:pl-6 sm:first-of-type:pl-3 lg:first-of-type:pl-6 2xl:first-of-type:pl-3 py-2.5 px-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                  <th scope="col" className="relative py-2.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && <TableSkeleton columnAmount={headings.length + 1} />}
                {error && (
                  <tr>
                    <td
                      colSpan={headings.length + 1}
                      className="py-2.5 text-sm text-center text-gray-500"
                    >
                      {errorMessage}
                      {'. '}
                      <button className={linkClass()} onClick={refetch}>
                        Retry
                      </button>
                    </td>
                  </tr>
                )}
                {rows?.length === 0 && (
                  <tr>
                    <td
                      colSpan={headings.length + 1}
                      className="py-2.5 text-sm text-center text-gray-500"
                    >
                      No data
                    </td>
                  </tr>
                )}
                {rows &&
                  rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {row.map((data, index, arr) => (
                        <td
                          key={index}
                          className={cn(
                            'first-of-type:pl-6 sm:first-of-type:pl-3 lg:first-of-type:pl-6 2xl:first-of-type:pl-3 whitespace-nowrap py-2 text-sm text-gray-800',
                            {
                              'relative pl-3 pr-4 text-right font-medium sm:pr-6':
                                index === arr.length - 1,
                              'px-3': index !== arr.length - 1,
                            },
                          )}
                        >
                          {data}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

type TableSkeletonProps = {
  columnAmount: number;
};

function TableSkeleton({ columnAmount }: TableSkeletonProps) {
  return (
    <Loop amount={10}>
      <tr>
        {Array.from({ length: columnAmount }, (_, i) => (
          <td
            key={i}
            className={cn('py-3.5', {
              'pl-4': i === 0,
              'relative pl-3 pr-4 sm:pr-6': i === columnAmount - 1,
              'px-3': i !== 0 && i !== columnAmount - 1,
            })}
          >
            <Skeleton />
          </td>
        ))}
      </tr>
    </Loop>
  );
}
