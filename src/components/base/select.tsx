import React from 'react';
import { Portal as ArkPortal, Select as ArkSelect } from '@ark-ui/react';
import { cn } from '@/libs/cn.lib';

type SelectOptionType = { label: string; value: string };

export function Select({
  className,
  positioning,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof ArkSelect>, 'items'> & {
  items: SelectOptionType[];
}) {
  return (
    <ArkSelect.Root
      positioning={{ sameWidth: true, ...positioning }}
      className={cn('grid gap-1.5', className)}
      {...props}
    />
  );
}

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof ArkSelect.Label>,
  React.ComponentPropsWithoutRef<typeof ArkSelect.Label>
>(({ children, className, ...props }, ref) => (
  <ArkSelect.Label
    ref={ref}
    className={cn('block text-sm font-medium text-gray-700', className)}
    {...props}
  >
    {children}
  </ArkSelect.Label>
));

SelectLabel.displayName = ArkSelect.Label.displayName;

type SelectTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof ArkSelect.Trigger>,
  'children'
> & {
  placeholder: string;
  error?: string;
};

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof ArkSelect.Trigger>,
  SelectTriggerProps
>(({ placeholder, error, className, ...props }, ref) => (
  <div className="grid gap-1.5">
    <ArkSelect.Control>
      <ArkSelect.Trigger
        ref={ref}
        className={cn(
          'whitespace-nowrap flex w-full justify-between gap-4 cursor-default items-center rounded-lg bg-white px-2.5 py-1.5 text-sm font-medium transition hover:bg-gray-100 focus:outline-2',
          error
            ? 'focus:outline-rose-600 shadow-haptic-rose-300 enabled:hover:shadow-haptic-rose-400'
            : 'focus:outline-brand-600 shadow-haptic-gray-300 enabled:hover:shadow-haptic-gray-400',
          className,
        )}
        {...props}
      >
        <ArkSelect.Value placeholder={placeholder} />

        <svg
          className="w-4.5 h-4.5 flex-shrink-0"
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
      </ArkSelect.Trigger>
    </ArkSelect.Control>
    {error && <p className="text-sm text-rose-500">{error}</p>}
  </div>
));

SelectTrigger.displayName = ArkSelect.Trigger.displayName;

export const SelectClearTrigger = ArkSelect.ClearTrigger;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof ArkSelect.Content>,
  React.ComponentPropsWithoutRef<typeof ArkSelect.Content>
>(({ children, className, ...props }, ref) => (
  <ArkPortal>
    <ArkSelect.Positioner>
      <ArkSelect.Content
        ref={ref}
        className={cn('rounded-md bg-white shadow-menu focus:outline-none p-1', className)}
        {...props}
      >
        <div className="flex flex-col gap-1">{children}</div>
      </ArkSelect.Content>
    </ArkSelect.Positioner>
  </ArkPortal>
));

SelectContent.displayName = ArkSelect.Content.displayName;

export const SelectItemGroup = ArkSelect.ItemGroup;

export const SelectItemGroupLabel = ArkSelect.ItemGroupLabel;

export const SelectOption = React.forwardRef<
  React.ElementRef<typeof ArkSelect.Item>,
  Omit<React.ComponentPropsWithoutRef<typeof ArkSelect.Item>, 'item'> & {
    item: SelectOptionType;
  }
>(({ className, item, ...props }, ref) => (
  <ArkSelect.Item
    ref={ref}
    item={item}
    className={cn(
      'cursor-default flex w-full items-center rounded-md px-2.5 py-1.5 text-sm font-medium',
      'data-[highlighted]:outline-none data-[highlighted]:bg-gray-100',
      'data-[disabled]:opacity-70',
      'aria-selected:text-brand-800 aria-selected:bg-brand-50',
      'aria-selected:data-[highlighted]:bg-brand-50',
      className,
    )}
    {...props}
  >
    <ArkSelect.ItemText>{item.label}</ArkSelect.ItemText>
    <ArkSelect.ItemIndicator />
  </ArkSelect.Item>
));

SelectOption.displayName = 'SelectOption';
