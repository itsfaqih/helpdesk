import * as React from 'react';
import * as Ark from '@ark-ui/react';
import { cn } from '@/libs/cn.lib';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

export const Pagination = React.forwardRef<
  React.ElementRef<typeof Ark.Pagination.Root>,
  React.ComponentPropsWithoutRef<typeof Ark.Pagination.Root>
>(({ className, ...props }, ref) => (
  <Ark.Pagination.Root ref={ref} className={cn('flex', className)} {...props} />
));

export const PaginationEllipsis = React.forwardRef<
  React.ElementRef<typeof Ark.Pagination.Ellipsis>,
  React.ComponentPropsWithoutRef<typeof Ark.Pagination.Ellipsis>
>(({ className, ...props }, ref) => (
  <Ark.Pagination.Ellipsis
    ref={ref}
    className={cn(
      'px-2 py-1 text-gray-800 text-sm w-8 h-8 flex items-center justify-center rounded-lg',
      className,
    )}
    {...props}
  />
));

export const PaginationPrevTrigger = React.forwardRef<
  React.ElementRef<typeof Ark.Pagination.PrevTrigger>,
  React.ComponentPropsWithoutRef<typeof Ark.Pagination.PrevTrigger>
>(({ children, className, ...props }, ref) => (
  <Ark.Pagination.PrevTrigger
    ref={ref}
    className={cn(
      'px-2 py-1 enabled:hover:bg-gray-100 disabled:cursor-not-allowed rounded-lg w-8 h-8 flex items-center justify-center enabled:active:bg-gray-200 text-gray-800 disabled:opacity-40',
      className,
    )}
    {...props}
  >
    {children ?? <CaretLeft className="w-5 h-5" />}
  </Ark.Pagination.PrevTrigger>
));

PaginationPrevTrigger.displayName = Ark.Pagination.PrevTrigger.displayName;

export const PaginationNextTrigger = React.forwardRef<
  React.ElementRef<typeof Ark.Pagination.NextTrigger>,
  React.ComponentPropsWithoutRef<typeof Ark.Pagination.NextTrigger>
>(({ children, className, ...props }, ref) => (
  <Ark.Pagination.NextTrigger
    ref={ref}
    className={cn(
      'px-2 py-1 enabled:hover:bg-gray-100 disabled:cursor-not-allowed rounded-lg w-8 h-8 flex items-center justify-center enabled:active:bg-gray-200 text-gray-800 disabled:opacity-40',
      className,
    )}
    {...props}
  >
    {children ?? <CaretRight className="w-5 h-5" />}
  </Ark.Pagination.NextTrigger>
));

PaginationNextTrigger.displayName = Ark.Pagination.NextTrigger.displayName;

export const PaginationItem = React.forwardRef<
  React.ElementRef<typeof Ark.PaginationItem>,
  React.ComponentPropsWithoutRef<typeof Ark.PaginationItem>
>(({ className, ...props }, ref) => (
  <Ark.PaginationItem
    ref={ref}
    className={cn(
      'tabular-nums aria-[current]:bg-haptic-brand-700 aria-[current]:text-white aria-[current]:hover:bg-haptic-brand-600 active:scale-95 text-gray-800 text-sm w-8 font-medium h-8 flex items-center justify-center disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg',
      className,
    )}
    {...props}
  />
));
