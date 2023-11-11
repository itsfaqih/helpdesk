import * as React from 'react';
import { Button } from '../base/button';
import { FloppyDisk } from '@phosphor-icons/react';

type SaveButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  'children' | 'leading' | 'severity'
>;

export const SaveButton = React.forwardRef<React.ElementRef<typeof Button>, SaveButtonProps>(
  ({ variant = 'filled', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        severity="primary"
        leading={(props) => <FloppyDisk {...props} />}
        {...props}
      >
        Save
      </Button>
    );
  },
);
