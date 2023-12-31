import { cn } from '@/libs/cn.lib';
import { VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

export const linkClass = cva(
  'text-sm font-medium hover:underline focus:outline-brand-600 underline-offset-2',
  {
    variants: {
      variant: {
        primary: 'text-brand-600',
        plain: 'text-gray-600',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

type LinkProps = React.ComponentPropsWithoutRef<typeof ReactRouterLink> & {
  variant?: VariantProps<typeof linkClass>['variant'];
};

export const Link = React.forwardRef<React.ElementRef<typeof ReactRouterLink>, LinkProps>(
  ({ variant, className, ...props }, ref) => {
    return (
      <ReactRouterLink ref={ref} className={cn(linkClass({ variant }), className)} {...props} />
    );
  },
);
