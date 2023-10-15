import React from 'react';
import { Button } from '../base/button';
import { Power } from '@phosphor-icons/react';

type DeactivateButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  'children' | 'variant' | 'leading'
> & {
  variant?: 'danger' | 'danger-plain' | 'danger-subtle';
};

export const DeactivateButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  DeactivateButtonProps
>(({ variant = 'danger-plain', ...props }, ref) => {
  return (
    <Button ref={ref} variant={variant} leading={(props) => <Power {...props} />} {...props}>
      Deactivate
    </Button>
  );
});
