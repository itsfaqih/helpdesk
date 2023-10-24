import React from 'react';
import * as Ark from '@ark-ui/react';
import { cn } from '@/libs/cn.lib';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

export const Pagination = React.forwardRef<
  React.ElementRef<typeof Ark.Pagination>,
  React.ComponentPropsWithoutRef<typeof Ark.Pagination>
>(({ className, ...props }, ref) => (
  <Ark.Pagination ref={ref} className={cn('flex', className)} {...props} />
));

export const PaginationEllipsis = React.forwardRef<
  React.ElementRef<typeof Ark.PaginationEllipsis>,
  React.ComponentPropsWithoutRef<typeof Ark.PaginationEllipsis>
>(({ className, ...props }, ref) => (
  <Ark.PaginationEllipsis
    ref={ref}
    className={cn(
      'px-2 py-1 text-gray-800 text-sm w-8 h-8 flex items-center justify-center rounded-lg',
      className,
    )}
    {...props}
  />
));

export const PaginationListItem = Ark.PaginationListItem;

export const PaginationList = React.forwardRef<
  React.ElementRef<typeof Ark.PaginationList>,
  React.ComponentPropsWithoutRef<typeof Ark.PaginationList>
>(({ className, ...props }, ref) => (
  <Ark.PaginationList ref={ref} className={cn('flex gap-x-1', className)} {...props} />
));

PaginationList.displayName = Ark.PaginationList.displayName;

export const PaginationPrevPageTrigger = React.forwardRef<
  React.ElementRef<typeof Ark.PaginationPrevPageTrigger>,
  React.ComponentPropsWithoutRef<typeof Ark.PaginationPrevPageTrigger>
>(({ children, className, ...props }, ref) => (
  <Ark.PaginationPrevPageTrigger
    ref={ref}
    className={cn(
      'px-2 py-1 enabled:hover:bg-gray-100 disabled:cursor-not-allowed rounded-lg w-8 h-8 flex items-center justify-center enabled:active:bg-gray-200 text-gray-800 disabled:opacity-40',
      className,
    )}
    {...props}
  >
    {children ?? <CaretLeft className="w-5 h-5" />}
  </Ark.PaginationPrevPageTrigger>
));

PaginationPrevPageTrigger.displayName = Ark.PaginationPrevPageTrigger.displayName;

export const PaginationNextPageTrigger = React.forwardRef<
  React.ElementRef<typeof Ark.PaginationNextPageTrigger>,
  React.ComponentPropsWithoutRef<typeof Ark.PaginationNextPageTrigger>
>(({ children, className, ...props }, ref) => (
  <Ark.PaginationNextPageTrigger
    ref={ref}
    className={cn(
      'px-2 py-1 enabled:hover:bg-gray-100 disabled:cursor-not-allowed rounded-lg w-8 h-8 flex items-center justify-center enabled:active:bg-gray-200 text-gray-800 disabled:opacity-40',
      className,
    )}
    {...props}
  >
    {children ?? <CaretRight className="w-5 h-5" />}
  </Ark.PaginationNextPageTrigger>
));

PaginationNextPageTrigger.displayName = Ark.PaginationNextPageTrigger.displayName;

export const PaginationPageTrigger = React.forwardRef<
  React.ElementRef<typeof Ark.PaginationPageTrigger>,
  React.ComponentPropsWithoutRef<typeof Ark.PaginationPageTrigger>
>(({ className, ...props }, ref) => (
  <Ark.PaginationPageTrigger
    ref={ref}
    className={cn(
      'tabular-nums aria-[current]:bg-brand-50 aria-[current]:text-brand-700 aria-[current]:hover:bg-brand-100 aria-[current]:hover:text-brand-800 aria-[current]:active:bg-brand-200 active:bg-gray-200 text-gray-800 text-sm w-8 font-medium h-8 flex items-center justify-center disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg',
      className,
    )}
    {...props}
  />
));
