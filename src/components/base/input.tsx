import React from 'react';
import { cn } from '@/libs/cn.lib';

export const inputClassName = ({
  invalid,
  className,
}: {
  invalid?: boolean;
  className?: string;
} = {}) =>
  cn(
    'flex rounded-md bg-white file:border-0 file:bg-transparent file:text-sm file:font-medium px-2.5 py-1.5 text-sm font-medium focus:outline-brand-600 disabled:cursor-not-allowed disabled:bg-gray-100',
    invalid
      ? 'shadow-haptic-rose-400 enabled:hover:shadow-haptic-rose-500 focus:outline-rose-600'
      : 'enabled:hover:shadow-haptic-gray-400 shadow-haptic-gray-300',
    className,
  );

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, readOnly, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={inputClassName({ invalid, className })}
        readOnly={readOnly}
        title={readOnly ? 'Read only' : undefined}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
