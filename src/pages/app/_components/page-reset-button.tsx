import { Button } from "@/components/base/button";
import { cn } from "@/libs/cn.lib";
import React from "react";
import { Link } from "react-router-dom";

export const AppPageResetButton = React.forwardRef<
  React.ElementRef<typeof Link>,
  Omit<React.ComponentPropsWithoutRef<typeof Link>, "children">
>(({ className, ...props }, ref) => {
  return (
    <Button
      as={Link}
      ref={ref}
      role="button"
      variant="transparent"
      className={cn("text-red-500", className)}
      {...props}
      data-testid="btn-reset"
    >
      Reset
    </Button>
  );
});