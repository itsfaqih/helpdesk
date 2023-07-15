import { cn } from "@/libs/cn.lib";
import React from "react";
import { Link as ReactRouterLink } from "react-router-dom";

export const linkClass = "text-sm font-medium text-brand-600 hover:underline";

export const Link = React.forwardRef<
  React.ElementRef<typeof ReactRouterLink>,
  React.ComponentPropsWithoutRef<typeof ReactRouterLink>
>(({ className, ...props }, ref) => {
  return (
    <ReactRouterLink
      ref={ref}
      className={cn(linkClass, className)}
      {...props}
    />
  );
});
