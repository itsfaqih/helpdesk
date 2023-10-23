import React from 'react';
import { Button } from '../base/button';
import { FloppyDisk } from '@phosphor-icons/react';

type SaveButtonProps = Omit<React.ComponentPropsWithoutRef<typeof Button>, 'children' | 'leading'>;

export const SaveButton = React.forwardRef<React.ElementRef<typeof Button>, SaveButtonProps>(
  ({ variant = 'primary', ...props }, ref) => {
    return (
      <Button ref={ref} variant={variant} leading={(props) => <FloppyDisk {...props} />} {...props}>
        Save
      </Button>
    );
  },
);
