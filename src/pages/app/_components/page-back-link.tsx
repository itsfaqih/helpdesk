import * as React from 'react';
import { CaretLeft } from '@phosphor-icons/react';
import { Button } from '@/components/base/button';
import { Link } from 'react-router-dom';

export const AppPageBackLink = React.forwardRef<
  React.ElementRef<typeof Link>,
  Omit<React.ComponentPropsWithoutRef<typeof Link>, 'children'>
>(({ ...props }, ref) => {
  return (
    <Button
      ref={ref}
      as={Link}
      variant="transparent"
      size="sm"
      leading={(props) => <CaretLeft {...props} />}
      {...props}
    >
      Back
    </Button>
  );
});
