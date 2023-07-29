import React from "react";
import { Link } from "@/components/base/link";
import { cn } from "@/libs/cn.lib";
import { CaretLeft } from "@phosphor-icons/react";

export const AppPageBackLink = React.forwardRef<
  React.ElementRef<typeof Link>,
  Omit<React.ComponentPropsWithoutRef<typeof Link>, "children">
>(({ className, ...props }, ref) => {
  return (
    <Link
      ref={ref}
      variant="plain"
      className={cn("inline-flex items-center gap-x-1.5", className)}
      data-testid="link-back"
      {...props}
    >
      <CaretLeft className="w-4 h-4" />
      <span>Back</span>
    </Link>
  );
});
