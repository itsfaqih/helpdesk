import React from "react";
import * as Ark from "@ark-ui/react";
import { cn } from "@/libs/cn.lib";

export const Menu = Ark.Menu;
export const MenuTrigger = Ark.MenuTrigger;

export const MenuContent = React.forwardRef<
  React.ElementRef<typeof Ark.MenuContent>,
  React.ComponentPropsWithoutRef<typeof Ark.MenuContent>
>(({ className, ...props }, ref) => (
  <Ark.Portal>
    <Ark.MenuPositioner>
      <Ark.MenuContent
        ref={ref}
        className={cn(
          "min-w-[14rem] rounded-md bg-white shadow-menu focus:outline-none p-1",
          className
        )}
        {...props}
      />
    </Ark.MenuPositioner>
  </Ark.Portal>
));

MenuContent.displayName = Ark.MenuContent.displayName;

export const MenuItem = React.forwardRef<
  React.ElementRef<typeof Ark.MenuItem>,
  React.ComponentPropsWithoutRef<typeof Ark.MenuItem>
>(({ className, ...props }, ref) => (
  <Ark.MenuItem
    ref={ref}
    className={cn(
      "flex w-full select-none items-center rounded-md px-2.5 py-2 text-sm font-medium",
      "data-[highlighted]:bg-gray-100",
      "data-[focus]:outline-none data-[focus]:bg-gray-100",
      className
    )}
    {...props}
  />
));

MenuItem.displayName = Ark.MenuItem.displayName;
