import React from 'react';
import * as Ark from '@ark-ui/react';
import { cn } from '@/libs/cn.lib';

export const Tabs = Ark.Tabs;

export const TabContent = Ark.TabContent;

export const TabIndicator = React.forwardRef<
  React.ElementRef<typeof Ark.TabIndicator>,
  React.ComponentProps<typeof Ark.TabIndicator>
>((props, ref) => {
  return <Ark.TabIndicator ref={ref} className="h-[2px] bottom-[-1px] bg-brand-600" {...props} />;
});

export const TabList = React.forwardRef<
  React.ElementRef<typeof Ark.TabList>,
  React.ComponentProps<typeof Ark.TabList>
>((props, ref) => {
  return (
    <Ark.TabList
      ref={ref}
      className="relative flex py-1 border-b border-gray-200 rounded-lg gap-x-3"
      {...props}
    />
  );
});

TabList.displayName = Ark.TabList.displayName;

export const tabTriggerClass = cn(
  'rounded-md px-1 py-2.5 text-sm font-medium shadow-sm transition',
  'aria-selected:text-brand-600 aria-selected:hover:text-brand-700',
  'aria-[selected=false]:text-gray-400 aria-[selected=false]:hover:text-gray-500',
);

export const TabTrigger = React.forwardRef<
  React.ElementRef<typeof Ark.TabTrigger>,
  React.ComponentProps<typeof Ark.TabTrigger>
>(({ className, ...props }, ref) => {
  return <Ark.TabTrigger ref={ref} className={cn(tabTriggerClass, className)} {...props} />;
});

TabTrigger.displayName = Ark.TabTrigger.displayName;
