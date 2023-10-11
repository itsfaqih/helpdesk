import React from "react";
import { Button } from "../base/button";
import { Archive } from "@phosphor-icons/react";

type ArchiveButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "children" | "variant" | "leading"
> & {
  variant?: "danger" | "danger-plain" | "danger-subtle";
};

export const ArchiveButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  ArchiveButtonProps
>(({ variant = "danger-plain", ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      leading={(props) => <Archive {...props} />}
      {...props}
    >
      Archive
    </Button>
  );
});
