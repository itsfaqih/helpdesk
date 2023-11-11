import * as React from 'react';
import { Card } from '@/components/base/card';
import { cn } from '@/libs/cn.lib';

export function PageFormCard({ className, ...props }: React.ComponentPropsWithoutRef<typeof Card>) {
  return (
    <Card
      className={cn('px-4.5 py-5 mt-4 sm:mx-0 -mx-6 sm:rounded-xl rounded-none', className)}
      {...props}
    />
  );
}
