import React from "react";
import { Label } from "@/components/base/label";
import { Input } from "@/components/base/input";
import { cn } from "@/libs/cn.lib";

type TextboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  srOnlyLabel?: boolean;
  errorPlaceholder?: boolean;
  helperText?: string;
  optional?: boolean;
};

export const Textbox = React.forwardRef<HTMLInputElement, TextboxProps>(
  (
    {
      label,
      error,
      srOnlyLabel,
      errorPlaceholder,
      helperText,
      optional,
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
          {label}{" "}
          {optional && <span className="text-gray-400">(Optional)</span>}
        </Label>
        <Input
          ref={ref}
          name={name}
          id={elementId}
          invalid={!!error}
          {...props}
        />
        {helperText && <p className="text-sm text-gray-500">{helperText}</p>}
        {!error && errorPlaceholder && <div className="h-5" />}
        {error && <p className="text-sm text-rose-500">{error}</p>}
      </div>
    );
  }
);
