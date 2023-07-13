import React from "react";
import * as Ark from "@ark-ui/react";
import { cn } from "@/libs/cn.lib";
import { X } from "@phosphor-icons/react";

export const Dialog = Ark.Dialog;

export const DialogTrigger = Ark.DialogTrigger;

export const DialogCloseTrigger = Ark.DialogCloseTrigger;

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof Ark.DialogTitle>,
  React.ComponentProps<typeof Ark.DialogTitle>
>(({ className, ...props }, ref) => {
  return (
    <Ark.DialogTitle
      ref={ref}
      className={cn("text-lg font-semibold text-gray-800 pr-8", className)}
      {...props}
    />
  );
});

DialogTitle.displayName = Ark.DialogTitle.displayName;

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof Ark.DialogDescription>,
  React.ComponentProps<typeof Ark.DialogDescription>
>(({ className, ...props }, ref) => {
  return (
    <Ark.DialogDescription
      ref={ref}
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  );
});

DialogDescription.displayName = Ark.DialogDescription.displayName;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof Ark.DialogContent>,
  React.ComponentProps<typeof Ark.DialogContent>
>(({ children, className, ...props }, ref) => {
  return (
    <Ark.Portal>
      <Ark.DialogBackdrop className="fixed inset-0 bg-gray-900/70" />
      <Ark.DialogContainer className="fixed inset-0 [&:not([hidden])]:flex items-center justify-center">
        <Ark.DialogContent
          ref={ref}
          className={cn(
            "relative flex flex-col py-5 px-6 bg-white rounded-lg shadow-lg",
            className
          )}
          {...props}
        >
          {children}
          <Ark.DialogCloseTrigger className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </Ark.DialogCloseTrigger>
        </Ark.DialogContent>
      </Ark.DialogContainer>
    </Ark.Portal>
  );
});

DialogContent.displayName = Ark.DialogContent.displayName;

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-y-1", className)} {...props} />;
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex gap-x-2.5 justify-end", className)} {...props} />
  );
}
