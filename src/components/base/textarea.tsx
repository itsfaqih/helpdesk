import React from "react";
import { cn } from "@/libs/cn.lib";

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ invalid, className, readOnly, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex rounded-md bg-white px-2.5 py-1.5 text-sm font-medium focus:outline-brand-600 disabled:cursor-not-allowed disabled:bg-gray-100",
          invalid
            ? "shadow-haptic-rose-400 enabled:hover:shadow-haptic-rose-500 focus:outline-rose-600"
            : "enabled:hover:shadow-haptic-gray-400 shadow-haptic-gray-300",
          className
        )}
        readOnly={readOnly}
        title={readOnly ? "Read only" : undefined}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";
