import React from "react";
import { Button } from "../base/button";
import { ArrowCounterClockwise } from "@phosphor-icons/react";

type RestoreButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "children" | "variant" | "leading"
>;

export const RestoreButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  RestoreButtonProps
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
