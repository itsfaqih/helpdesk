import * as React from 'react';
import { Button } from '../base/button';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { cn } from '@/libs/cn.lib';

type RestoreButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  'children' | 'variant' | 'leading'
>;

export const RestoreButton = React.forwardRef<React.ElementRef<typeof Button>, RestoreButtonProps>(
  (props, ref) => {
    return (
      <Button
        ref={ref}
        variant="white"
        leading={({ className, ...props }) => (
          <ArrowCounterClockwise className={cn(className, 'text-brand-600')} {...props} />
        )}
        {...props}
      >
        Restore
      </Button>
    );
  },
);
