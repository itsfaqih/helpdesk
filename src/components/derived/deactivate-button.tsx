import * as React from 'react';
import { Button } from '../base/button';
import { Power } from '@phosphor-icons/react';

type DeactivateButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  'children' | 'severity' | 'leading'
>;

export const DeactivateButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  DeactivateButtonProps
>(({ variant = 'white', ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      severity="danger"
      leading={(props) => <Power {...props} />}
      {...props}
    >
      Deactivate
    </Button>
  );
});
