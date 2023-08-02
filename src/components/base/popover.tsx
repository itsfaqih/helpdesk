import React from "react";
import * as Ark from "@ark-ui/react";
import { cn } from "@/libs/cn.lib";

export const Popover = Ark.Popover;

export const PopoverTrigger = Ark.PopoverTrigger;

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof Ark.PopoverContent>,
  React.ComponentPropsWithoutRef<typeof Ark.PopoverContent>
>(({ className, ...props }, ref) => {
  return (
    <Ark.PopoverPositioner>
      <Ark.PopoverContent
        ref={ref}
        className={cn(
          "bg-white rounded-lg shadow-menu px-3 py-2 animate-in fade-in slide-in-from-bottom-4",
          className
        )}
        {...props}
      />
    </Ark.PopoverPositioner>
  );
});

export const PopoverTitle = Ark.PopoverTitle;

export const PopoverDescription = Ark.PopoverDescription;

export const PopoverCloseTrigger = Ark.PopoverCloseTrigger;
