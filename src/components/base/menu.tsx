import * as React from 'react';
import * as Ark from '@ark-ui/react';
import { cn } from '@/libs/cn.lib';

export const Menu = Ark.Menu;
export const MenuTrigger = Ark.Menu.Trigger;
export const MenuContextTrigger = Ark.Menu.ContextTrigger;

export const MenuContent = React.forwardRef<
  React.ElementRef<typeof Ark.Menu.Content>,
  React.ComponentPropsWithoutRef<typeof Ark.Menu.Content>
>(({ className, ...props }, ref) => (
  <Ark.Portal>
    <Ark.MenuPositioner>
      <Ark.MenuContent
        ref={ref}
        className={cn(
          'min-w-[14rem] rounded-md bg-white shadow-menu focus:outline-none p-1',
          'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95',
          'data-[state=open]:data-[placement^=top]:slide-in-from-bottom-4',
          'data-[state=open]:data-[placement^=bottom]:slide-in-from-top-4',
          'data-[state=open]:data-[placement^=left]:slide-in-from-right-4',
          'data-[state=open]:data-[placement^=right]:slide-in-from-left-4',
          'data-[state=closed]:data-[placement^=top]:slide-out-to-bottom-4',
          'data-[state=closed]:data-[placement^=bottom]:slide-out-to-top-4',
          'data-[state=closed]:data-[placement^=left]:slide-out-to-right-4',
          'data-[state=closed]:data-[placement^=right]:slide-out-to-left-4',
          className,
        )}
        {...props}
      />
    </Ark.MenuPositioner>
  </Ark.Portal>
));

MenuContent.displayName = Ark.Menu.Content.displayName;

type MenuItemProps = React.ComponentPropsWithoutRef<typeof Ark.Menu.Item> & {
  severity?: boolean;
};

export const MenuItem = React.forwardRef<React.ElementRef<typeof Ark.Menu.Item>, MenuItemProps>(
  ({ severity: destructive, children, className, ...props }, ref) => (
    <Ark.Menu.Item
      ref={ref}
      className={cn(
        'flex w-full gap-2 select-none items-center rounded-lg px-2.5 py-2 text-sm font-medium',
        'data-[focus]:outline-none data-[focus]:bg-gray-100',
        {
          'data-[highlighted]:bg-gray-100': !destructive,
          'text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700': destructive,
        },
        className,
      )}
      {...props}
    >
      {children}
    </Ark.Menu.Item>
  ),
);

MenuItem.displayName = Ark.Menu.Item.displayName;

export const MenuSeparator = React.forwardRef<
  React.ElementRef<typeof Ark.Menu.Separator>,
  React.ComponentPropsWithoutRef<typeof Ark.Menu.Separator>
>((props, ref) => (
  <Ark.Menu.Separator ref={ref} className="border-t border-gray-300 my-1" {...props} />
));
