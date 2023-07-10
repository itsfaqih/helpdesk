import React from "react";
import { Label } from "@/components/base/label";
import { Input } from "@/components/base/input";
import { cn } from "@/libs/cn.lib";

type Textbox = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Textbox = React.forwardRef<HTMLInputElement, Textbox>(
  ({ label, error, id, className, ...props }, ref) => {
    const generatedId = React.useId();
    const elementId = id || generatedId;

    return (
      <div className={cn("grid w-full items-center gap-1.5", className)}>
        <Label htmlFor={elementId}>{label}</Label>
        <Input ref={ref} id={elementId} invalid={!!error} {...props} />
        {error && <p className="text-sm text-rose-500">{error}</p>}
      </div>
    );
  }
);
