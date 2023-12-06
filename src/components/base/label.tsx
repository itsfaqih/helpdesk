import { cn } from '@/libs/cn.lib';
import * as React from 'react';

export const labelClass = 'leading-none text-sm font-medium text-gray-700';

export const Label = React.forwardRef<
  React.ElementRef<'label'>,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return <label ref={ref} className={cn(labelClass, className)} {...props} />;
});

Label.displayName = 'Label';
