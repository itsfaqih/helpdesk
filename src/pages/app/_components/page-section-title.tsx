import * as React from 'react';
import { cn } from '@/libs/cn.lib';

export function PageSectionTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('font-semibold text-gray-600', className)} {...props} />;
}
