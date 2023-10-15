import React from 'react';
import { Button } from '../base/button';
import { FloppyDisk } from '@phosphor-icons/react';

type SaveButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  'children' | 'variant' | 'leading'
>;

export const SaveButton = React.forwardRef<React.ElementRef<typeof Button>, SaveButtonProps>(
  (props, ref) => {
    return (
      <Button ref={ref} variant="primary" leading={(props) => <FloppyDisk {...props} />} {...props}>
        Save
      </Button>
    );
  },
);
