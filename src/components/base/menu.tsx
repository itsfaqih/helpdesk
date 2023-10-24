import React from 'react';
import * as Ark from '@ark-ui/react';
import { cn } from '@/libs/cn.lib';

export const Menu = Ark.Menu;
export const MenuTrigger = Ark.MenuTrigger;
export const MenuContextTrigger = Ark.MenuContextTrigger;

export const MenuContent = React.forwardRef<
  React.ElementRef<typeof Ark.MenuContent>,
  React.ComponentPropsWithoutRef<typeof Ark.MenuContent>
>(({ className, ...props }, ref) => (
  <Ark.Portal>
    <Ark.MenuPositioner>
      <Ark.MenuContent
        ref={ref}
        className={cn(
          'min-w-[14rem] rounded-md bg-white shadow-menu focus:outline-none p-1',
          className,
        )}
        {...props}
      />
    </Ark.MenuPositioner>
  </Ark.Portal>
));

MenuContent.displayName = Ark.MenuContent.displayName;

type MenuItemProps = React.ComponentPropsWithoutRef<typeof Ark.MenuItem> & {
  destructive?: boolean;
};

export const MenuItem = React.forwardRef<React.ElementRef<typeof Ark.MenuItem>, MenuItemProps>(
  ({ destructive, className, ...props }, ref) => (
    <Ark.MenuItem
      ref={ref}
      className={cn(
        'flex w-full select-none items-center rounded-lg px-2.5 py-2 text-sm font-medium',
        'data-[focus]:outline-none data-[focus]:bg-gray-100',
        {
          'data-[highlighted]:bg-gray-100': !destructive,
          'text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700': destructive,
        },
        className,
      )}
      {...props}
    />
  ),
);

MenuItem.displayName = Ark.MenuItem.displayName;
