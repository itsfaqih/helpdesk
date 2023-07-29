import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/libs/cn.lib";

type FadeInContainerProps = React.ComponentPropsWithoutRef<
  typeof motion.div
> & {
  from?: "top" | "bottom" | "left" | "right";
};

export function FadeInContainer({
  from = "bottom",
  className,
  ...props
}: FadeInContainerProps) {
  const yFrom = (from === "top" && -20) || (from === "bottom" && 20) || 0;
  const xFrom = (from === "left" && -20) || (from === "right" && 20) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: yFrom, x: xFrom }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: yFrom, x: xFrom }}
      className={cn(className)}
      {...props}
    />
  );
}
