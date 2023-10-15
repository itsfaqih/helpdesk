import { cn } from '@/libs/cn.lib';
import React from 'react';

export const labelClass = 'text-sm font-medium text-gray-700';

export const Label = React.forwardRef<
  React.ElementRef<'label'>,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return <label ref={ref} className={cn(labelClass, className)} {...props} />;
});

Label.displayName = 'Label';
