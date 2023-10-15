import React from 'react';
import { Button } from '../base/button';
import { Power } from '@phosphor-icons/react';
import { cn } from '@/libs/cn.lib';

type ActivateButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  'children' | 'variant' | 'leading'
>;

export const ActivateButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  ActivateButtonProps
>((props, ref) => {
  return (
    <Button
      ref={ref}
      variant="plain"
      leading={({ className, ...props }) => (
        <Power className={cn(className, 'text-brand-600')} {...props} />
      )}
      {...props}
    >
      Activate
    </Button>
  );
});
