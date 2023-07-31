import * as React from "react";
import { cn } from "@/libs/cn.lib";
import { Loop } from "./loop";
import { Skeleton } from "./skeleton";
import { linkClass } from "./link";

type TableProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  headings: React.ReactNode[];
  rows?: React.ReactNode[][];
  loading?: boolean;
  error?: boolean;
  refetch?: () => void;
  errorMessage?: string;
};

export function Table({
  id,
  headings,
  rows,
  loading,
  error,
  refetch,
  errorMessage = "Something went wrong when fetching data",
  className,
  ...props
}: TableProps) {
  return (
    <div
      className={cn("flow-root min-h-[36.75rem]", className)}
      data-testid={`table-${id}`}
      {...props}
    >
      <div className="-mx-6 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-6">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-6">
          <div className="overflow-hidden shadow-haptic-gray-300 sm:rounded-md">
            <table className="min-w-full text-sm divide-y divide-gray-300">
              <thead>
                <tr data-testid={`table-${id}-heading`}>
                  {headings.map((heading, index) => (
                    <th
                      key={index}
                      scope="col"
                      className={cn(
                        "py-3.5 text-left text-sm font-medium text-gray-500 whitespace-nowrap",
                        {
                          "pl-4 pr-3": index === 0,
                          "px-3": index !== 0,
                        }
                      )}
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
                {loading && (
                  <TableSkeleton
                    tableId={id}
                    columnAmount={headings.length + 1}
                  />
                )}
                {error && (
                  <tr data-testid={`table-${id}-error`}>
                    <td
                      colSpan={headings.length + 1}
                      className="py-2.5 text-sm text-center text-gray-500"
                    >
                      {errorMessage}
                      {". "}
                      <button className={linkClass()} onClick={refetch}>
                        Retry
                      </button>
                    </td>
                  </tr>
                )}
                {rows?.length === 0 && (
                  <tr data-testid={`table-${id}-empty`}>
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
                    <tr
                      key={rowIndex}
                      className="hover:bg-gray-50"
                      data-testid={`table-${id}-${rowIndex}`}
                    >
                      {row.map((data, index, arr) => (
                        <td
                          key={index}
                          className={cn(
                            "whitespace-nowrap py-2.5 text-sm text-gray-800",
                            {
                              "pl-4": index === 0,
                              "relative pl-3 pr-4 text-right font-medium sm:pr-6":
                                index === arr.length - 1,
                              "px-3": index !== 0 && index !== arr.length - 1,
                            }
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
  tableId: string;
  columnAmount: number;
};

function TableSkeleton({ tableId, columnAmount }: TableSkeletonProps) {
  return (
    <Loop amount={10}>
      <tr data-testid={`table-${tableId}-loading`}>
        {Array.from({ length: columnAmount }, (_, i) => (
          <td
            key={i}
            className={cn("py-3.5", {
              "pl-4": i === 0,
              "relative pl-3 pr-4 sm:pr-6": i === columnAmount - 1,
              "px-3": i !== 0 && i !== columnAmount - 1,
            })}
          >
            <Skeleton />
          </td>
        ))}
      </tr>
    </Loop>
  );
}
