import React from "react";
import * as Ark from "@ark-ui/react";
import { cn } from "@/libs/cn.lib";

export const Tooltip = Ark.Tooltip;

export const TooltipTrigger = Ark.TooltipTrigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof Ark.TooltipContent>,
  React.ComponentPropsWithoutRef<typeof Ark.TooltipContent>
>(({ className, ...props }, ref) => {
  return (
    <Ark.TooltipPositioner>
      <Ark.TooltipArrow {...props}>
        <Ark.TooltipArrowTip className={cn("bg-gray-900", className)} />
      </Ark.TooltipArrow>
      <Ark.TooltipContent
        ref={ref}
        className={cn(
          "animate-in fade-in slide-in-from-bottom-4 bg-gray-900 text-sm px-2 py-1 rounded-md text-white pointer-events-none",
          className
        )}
        {...props}
      />
    </Ark.TooltipPositioner>
  );
});

TooltipContent.displayName = Ark.TooltipContent.displayName;
