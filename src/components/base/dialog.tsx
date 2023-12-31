import * as React from 'react';
import * as Ark from '@ark-ui/react';
import { cn } from '@/libs/cn.lib';
import { X } from '@phosphor-icons/react';

export const Dialog = Ark.Dialog.Root;

export const DialogTrigger = Ark.Dialog.Trigger;

export const DialogCloseTrigger = Ark.Dialog.CloseTrigger;

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof Ark.Dialog.Title>,
  React.ComponentProps<typeof Ark.Dialog.Title>
>(({ className, ...props }, ref) => {
  return (
    <Ark.Dialog.Title
      ref={ref}
      className={cn('text-lg font-semibold text-gray-800 pr-8', className)}
      {...props}
    />
  );
});

DialogTitle.displayName = Ark.Dialog.Title.displayName;

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof Ark.Dialog.Description>,
  React.ComponentProps<typeof Ark.Dialog.Description>
>(({ className, ...props }, ref) => {
  return (
    <Ark.Dialog.Description
      ref={ref}
      className={cn('text-sm text-gray-500', className)}
      {...props}
    />
  );
});

DialogDescription.displayName = Ark.Dialog.Description.displayName;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof Ark.Dialog.Content>,
  React.ComponentProps<typeof Ark.Dialog.Content>
>(({ children, className, ...props }, ref) => {
  return (
    <Ark.Portal>
      <Ark.Dialog.Backdrop
        className={cn(
          'fixed inset-0 bg-gray-900/70',
          'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:duration-300',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-300',
        )}
      />
      <Ark.Dialog.Positioner className="fixed inset-0 [&:not([hidden])]:flex items-center justify-center">
        <Ark.Dialog.Content
          ref={ref}
          className={cn(
            'relative [&:not([hidden])]:flex flex-col py-5 px-6 bg-white rounded-lg shadow-lg',
            'data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=open]:fade-in data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            className,
          )}
          {...props}
        >
          {children}
          <Ark.Dialog.CloseTrigger className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </Ark.Dialog.CloseTrigger>
        </Ark.Dialog.Content>
      </Ark.Dialog.Positioner>
    </Ark.Portal>
  );
});

DialogContent.displayName = Ark.DialogContent.displayName;

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-y-1', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex gap-x-2.5 justify-end', className)} {...props} />;
}
