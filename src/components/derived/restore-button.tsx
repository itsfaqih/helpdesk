import React from "react";
import { Button } from "../base/button";
import { ArrowCounterClockwise } from "@phosphor-icons/react";

type ArchiveButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "children" | "variant" | "leading"
>;

export const RestoreButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  ArchiveButtonProps
>((props, ref) => {
  return (
    <Button
      ref={ref}
      variant="plain"
      leading={(props) => <ArrowCounterClockwise {...props} />}
      {...props}
    >
      Restore
    </Button>
  );
});
