"use client";

import React from "react";
import * as Ark from "@ark-ui/react";
import { cn } from "@/libs/cn.lib";

export const Select = Ark.Select;

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof Ark.SelectLabel>,
  React.ComponentPropsWithoutRef<typeof Ark.SelectLabel>
>(({ children, className, ...props }, ref) => (
  <Ark.SelectLabel
    ref={ref}
    className={cn("block text-sm font-medium text-gray-700", className)}
    {...props}
  >
    {children}
  </Ark.SelectLabel>
));

SelectLabel.displayName = Ark.SelectLabel.displayName;

type SelectTriggerProps = React.ComponentPropsWithoutRef<
  typeof Ark.SelectTrigger
> & {
  error?: string;
};

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof Ark.SelectTrigger>,
  SelectTriggerProps
>(({ error, children, className, ...props }, ref) => (
  <div>
    <Ark.SelectTrigger
      ref={ref}
      className={cn(
        "flex w-full justify-between cursor-default items-center rounded-md bg-white px-3 py-2 text-sm font-medium transition hover:bg-gray-100 focus:outline-2",
        error
          ? "focus:outline-rose-600 shadow-haptic-rose-300 enabled:hover:shadow-haptic-rose-400"
          : "focus:outline-brand-600 shadow-haptic-gray-300 enabled:hover:shadow-haptic-gray-400",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="ml-16 w-4.5 h-4.5"
        width="18"
        height="19"
        viewBox="0 0 18 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.7728 12.477C12.8251 12.5292 12.8666 12.5913 12.8949 12.6595C12.9232 12.7278 12.9378 12.801 12.9378 12.875C12.9378 12.9489 12.9232 13.0221 12.8949 13.0904C12.8666 13.1586 12.8251 13.2207 12.7728 13.2729L9.39779 16.6479C9.34555 16.7002 9.28351 16.7417 9.21523 16.77C9.14694 16.7983 9.07375 16.8129 8.99982 16.8129C8.9259 16.8129 8.85271 16.7983 8.78442 16.77C8.71613 16.7417 8.6541 16.7002 8.60186 16.6479L5.22686 13.2729C5.12131 13.1674 5.06201 13.0242 5.06201 12.875C5.06201 12.7257 5.12131 12.5825 5.22686 12.477C5.3324 12.3714 5.47556 12.3121 5.62482 12.3121C5.77409 12.3121 5.91725 12.3714 6.02279 12.477L8.99982 15.4547L11.9769 12.477C12.0291 12.4247 12.0911 12.3832 12.1594 12.3549C12.2277 12.3266 12.3009 12.312 12.3748 12.312C12.4487 12.312 12.5219 12.3266 12.5902 12.3549C12.6585 12.3832 12.7206 12.4247 12.7728 12.477ZM6.02279 6.52292L8.99982 3.54519L11.9769 6.52292C12.0824 6.62847 12.2256 6.68777 12.3748 6.68777C12.5241 6.68777 12.6672 6.62847 12.7728 6.52292C12.8783 6.41738 12.9376 6.27422 12.9376 6.12495C12.9376 5.97569 12.8783 5.83253 12.7728 5.72699L9.39779 2.35199C9.34555 2.29969 9.28351 2.2582 9.21523 2.22989C9.14694 2.20158 9.07375 2.18701 8.99982 2.18701C8.9259 2.18701 8.85271 2.20158 8.78442 2.22989C8.71613 2.2582 8.6541 2.29969 8.60186 2.35199L5.22686 5.72699C5.12131 5.83253 5.06201 5.97569 5.06201 6.12495C5.06201 6.27422 5.12131 6.41738 5.22686 6.52292C5.3324 6.62847 5.47556 6.68777 5.62482 6.68777C5.77409 6.68777 5.91725 6.62847 6.02279 6.52292Z"
          fill="black"
        />
      </svg>
    </Ark.SelectTrigger>
    {error && <p className="text-sm text-rose-500 mt-1.5">{error}</p>}
  </div>
));

SelectTrigger.displayName = Ark.SelectTrigger.displayName;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof Ark.SelectContent>,
  React.ComponentPropsWithoutRef<typeof Ark.SelectContent>
>(({ className, ...props }, ref) => (
  <Ark.Portal>
    <Ark.SelectPositioner>
      <Ark.SelectContent
        ref={ref}
        className={cn(
          "rounded-md bg-white shadow-menu focus:outline-none p-1",
          className
        )}
        {...props}
      />
    </Ark.SelectPositioner>
  </Ark.Portal>
));

SelectContent.displayName = Ark.SelectContent.displayName;

export const SelectOption = React.forwardRef<
  React.ElementRef<typeof Ark.SelectOption>,
  React.ComponentPropsWithoutRef<typeof Ark.SelectOption>
>(({ className, ...props }, ref) => (
  <Ark.SelectOption
    ref={ref}
    className={cn(
      "cursor-default flex w-full items-center rounded-md p-2 text-sm font-medium",
      "data-[focus]:outline-none data-[focus]:bg-gray-100",
      "data-[disabled]:opacity-70",
      className
    )}
    {...props}
  />
));

SelectOption.displayName = Ark.SelectOption.displayName;