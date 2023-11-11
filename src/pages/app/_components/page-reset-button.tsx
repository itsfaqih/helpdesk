import { Button } from '@/components/base/button';
import * as React from 'react';
import { Link } from 'react-router-dom';

export const AppPageResetButton = React.forwardRef<
  React.ElementRef<typeof Link>,
  Omit<React.ComponentPropsWithoutRef<typeof Link>, 'children'>
>(({ className, ...props }, ref) => {
  return (
    <Button
      as={Link}
      ref={ref}
      role="button"
      variant="transparent"
      severity="danger"
      className={className}
      {...props}
      data-testid="btn-reset"
    >
      Reset
    </Button>
  );
});
