import { cn } from '@/libs/cn.lib';
import React from 'react';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('h-5 w-full animate-pulse rounded bg-gray-200', className)} {...props}></div>
  );
}
