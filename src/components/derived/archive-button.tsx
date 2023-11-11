import * as React from 'react';
import { Button } from '../base/button';
import { Archive } from '@phosphor-icons/react';

type ArchiveButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  'children' | 'leading' | 'severity'
>;

export const ArchiveButton = React.forwardRef<React.ElementRef<typeof Button>, ArchiveButtonProps>(
  ({ variant = 'white', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        severity="danger"
        variant={variant}
        leading={(props) => <Archive {...props} />}
        {...props}
      >
        Archive
      </Button>
    );
  },
);
