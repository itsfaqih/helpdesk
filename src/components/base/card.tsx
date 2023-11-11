import { cn } from '@/libs/cn.lib';
import * as React from 'react';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('shadow-haptic-gray-300 rounded-xl bg-white', className)}
        {...props}
      />
    );
  },
);
