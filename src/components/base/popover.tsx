import * as React from 'react';
import * as Ark from '@ark-ui/react';
import { cn } from '@/libs/cn.lib';

export function Popover(props: React.ComponentPropsWithoutRef<typeof Ark.Popover>) {
  return <Ark.Popover {...props} />;
}

export const PopoverTrigger = Ark.PopoverTrigger;

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof Ark.PopoverContent>,
  React.ComponentPropsWithoutRef<typeof Ark.PopoverContent>
>(({ className, ...props }, ref) => {
  return (
    <Ark.Portal>
      <Ark.PopoverPositioner>
        <Ark.PopoverContent
          ref={ref}
          className={cn(
            'bg-white rounded-xl shadow-menu px-3 py-2',
            'data-[state=open]:data-[placement^=right]:slide-in-from-left-4',
            'data-[state=open]:data-[placement^=left]:slide-in-from-right-4',
            'data-[state=open]:data-[placement^=top]:slide-in-from-bottom-4',
            'data-[state=open]:data-[placement^=bottom]:slide-in-from-top-4',
            'data-[state=closed]:data-[placement^=right]:slide-out-to-left-4',
            'data-[state=closed]:data-[placement^=left]:slide-out-to-right-4',
            'data-[state=closed]:data-[placement^=top]:slide-out-to-bottom-4',
            'data-[state=closed]:data-[placement^=bottom]:slide-out-to-top-4',
            'data-[state=open]:animate-in data-[state=open]:fade-in',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out',
            className,
          )}
          {...props}
        />
      </Ark.PopoverPositioner>
    </Ark.Portal>
  );
});

export const PopoverTitle = Ark.PopoverTitle;

export const PopoverDescription = Ark.PopoverDescription;

export const PopoverCloseTrigger = Ark.PopoverCloseTrigger;

export const PopoverAnchor = Ark.PopoverAnchor;

export const PopoverArrow = Ark.PopoverArrow;

export const PopoverArrowTip = Ark.PopoverArrowTip;
