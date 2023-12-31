import * as React from 'react';
import * as Ark from '@ark-ui/react';
import { cn } from '@/libs/cn.lib';
import { Check, Minus } from '@phosphor-icons/react';
import { labelClass } from '@/components/base/label';

type CheckboxProps = Omit<React.ComponentPropsWithoutRef<typeof Ark.Checkbox.Root>, 'children'> & {
  label: string;
};

export const Checkbox = React.forwardRef<React.ElementRef<typeof Ark.Checkbox.Root>, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <Ark.Checkbox.Root
        ref={ref}
        className={cn('inline-flex items-center gap-x-2', className)}
        {...props}
      >
        {(api) => (
          <>
            <Ark.CheckboxControl
              className={cn(
                'shadow-haptic-sm-gray-700 h-4.5 w-4.5 rounded-md bg-white text-white inline-flex items-center justify-center transition-colors',
                'data-[focus]:outline data-[focus]:outline-offset-2 data-[focus]:outline-2 data-[focus]:outline-brand-700',
                'data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-700',
                'data-[hover]:shadow-haptic-gray-400',
              )}
            >
              {api.isChecked && <Check weight="bold" className="w-3 h-3" />}
              {api.isIndeterminate && <Minus weight="bold" className="w-3 h-3" />}
            </Ark.CheckboxControl>
            <Ark.CheckboxLabel className={labelClass}>{label}</Ark.CheckboxLabel>
          </>
        )}
      </Ark.Checkbox.Root>
    );
  },
);

Checkbox.displayName = Ark.Checkbox.displayName;
