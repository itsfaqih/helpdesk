import React from "react";
import { cn } from "@/libs/cn.lib";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex rounded-md bg-white px-2.5 py-1.5 text-sm font-medium hover:shadow-haptic-gray-400 shadow-haptic-gray-300 focus:outline-brand-600",
          invalid &&
            "shadow-haptic-rose-400 hover:shadow-haptic-rose-500 focus:outline-rose-600",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
