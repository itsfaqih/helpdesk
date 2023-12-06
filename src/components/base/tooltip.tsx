import * as React from 'react';
import * as Ark from '@ark-ui/react';
import { cn } from '@/libs/cn.lib';

export const Tooltip = Ark.Tooltip;

export const TooltipTrigger = Ark.TooltipTrigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof Ark.TooltipContent>,
  React.ComponentPropsWithoutRef<typeof Ark.TooltipContent>
>(({ className, ...props }, ref) => {
  return (
    <Ark.Portal>
      <Ark.TooltipPositioner>
        <Ark.TooltipArrow {...props}>
          <Ark.TooltipArrowTip className={cn('bg-gray-900', className)} />
        </Ark.TooltipArrow>
        <Ark.TooltipContent
          ref={ref}
          className={cn(
            'bg-gray-900 text-sm px-2 py-1 rounded-md text-white pointer-events-none',
            'data-[state=open]:data-[placement^=right]:slide-in-from-left-4',
            'data-[state=open]:data-[placement^=left]:slide-in-from-right-4',
            'data-[state=open]:data-[placement^=top]:slide-in-from-bottom-4',
            'data-[state=open]:data-[placement^=bottom]:slide-in-from-top-4',
            'data-[state=closed]:data-[placement^=right]:slide-out-to-left-4',
            'data-[state=closed]:data-[placement^=left]:slide-out-to-right-4',
            'data-[state=closed]:data-[placement^=top]:slide-out-to-bottom-4',
            'data-[state=closed]:data-[placement^=bottom]:slide-out-to-top-4',
            'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-90',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-90',
            className,
          )}
          {...props}
        />
      </Ark.TooltipPositioner>
    </Ark.Portal>
  );
});

TooltipContent.displayName = Ark.TooltipContent.displayName;
