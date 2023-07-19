import React from "react";
import { Label } from "@/components/base/label";
import { cn } from "@/libs/cn.lib";
import { TextArea } from "../base/textarea";

type TextAreaboxProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  srOnlyLabel?: boolean;
  errorPlaceholder?: boolean;
};

export const TextAreabox = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaboxProps
>(
  (
    {
      label,
      error,
      srOnlyLabel,
      errorPlaceholder,
      id,
      name,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const elementId = id || name || generatedId;

    return (
      <div className={cn("grid w-full items-center gap-1.5", className)}>
        <Label
          htmlFor={elementId}
          className={cn({
            "sr-only": srOnlyLabel,
          })}
        >
          {label}
        </Label>
        <TextArea
          ref={ref}
          name={name}
          id={elementId}
          invalid={!!error}
          {...props}
        />
        {!error && errorPlaceholder && <div className="h-5" />}
        {error && <p className="text-sm text-rose-500">{error}</p>}
      </div>
    );
  }
);
