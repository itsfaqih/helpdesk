import React from "react";
import { cn } from "@/libs/cn.lib";

type FadeInContainerProps = React.ComponentPropsWithoutRef<"div"> & {
  from?: "top" | "bottom" | "left" | "right";
};

export function FadeInContainer({
  from = "bottom",
  className,
  ...props
}: FadeInContainerProps) {
  const slideInFrom =
    (from === "top" && "slide-in-from-top-4") ||
    (from === "bottom" && "slide-in-from-bottom-4") ||
    (from === "left" && "slide-in-from-left-4") ||
    (from === "right" && "slide-in-from-right-4");

  return (
    <div
      className={cn("animate-in fade-in duration-200", slideInFrom, className)}
      {...props}
    />
  );
}
