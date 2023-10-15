import React from 'react';
import { Label } from '@/components/base/label';
import { cn } from '@/libs/cn.lib';
import { TextArea } from '../base/textarea';

type TextAreaboxProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  srOnlyLabel?: boolean;
  helperText?: string;
  optional?: boolean;
};

export const TextAreabox = React.forwardRef<HTMLTextAreaElement, TextAreaboxProps>(
  ({ label, error, srOnlyLabel, helperText, optional, id, name, className, ...props }, ref) => {
    const generatedId = React.useId();
    const elementId = id || name || generatedId;

    return (
      <div className={cn('grid w-full items-center gap-1.5', className)}>
        <Label
          htmlFor={elementId}
          className={cn({
            'sr-only': srOnlyLabel,
          })}
        >
          {label} {optional && <span className="text-gray-400">(Optional)</span>}
        </Label>
        <TextArea ref={ref} name={name} id={elementId} invalid={!!error} {...props} />
        {helperText && <p className="text-sm text-gray-500">{helperText}</p>}
        {error && <p className="text-sm text-rose-500">{error}</p>}
      </div>
    );
  },
);
