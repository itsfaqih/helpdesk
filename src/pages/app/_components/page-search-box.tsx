import * as React from 'react';
import { Textbox } from '@/components/derived/textbox';
import { cn } from '@/libs/cn.lib';

export const AppPageSearchBox = React.forwardRef<
  React.ElementRef<typeof Textbox>,
  Omit<React.ComponentPropsWithoutRef<typeof Textbox>, 'label'>
>(({ placeholder, className, ...props }, ref) => {
  return (
    <Textbox
      ref={ref}
      name="search"
      label="Search"
      type="search"
      placeholder={placeholder ?? 'Search...'}
      noLabel
      className={cn('flex-1 min-w-[20rem]', className)}
      {...props}
    />
  );
});
