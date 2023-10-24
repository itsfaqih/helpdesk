import { VariantProps, cva } from 'class-variance-authority';
import { Check } from '@phosphor-icons/react';
import { cn } from '@/libs/cn.lib';
import { PropsWithAs, forwardRefWithAs } from '@/utils/as.util';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { Spinner } from './spinner';

type ButtonProps = {
  size?: VariantProps<typeof buttonClass>['size'];
  variant?: VariantProps<typeof buttonClass>['variant'];
  leading?: (props: { className: string }) => React.ReactNode;
  trailing?: (props: { className: string }) => React.ReactNode;
  loading?: boolean;
  success?: boolean;
};

function ButtonComponent(
  {
    as: Component = 'button',
    size = 'md',
    variant = 'transparent',
    leading,
    trailing,
    loading,
    success,
    disabled,
    className,
    children,
    ...props
  }: PropsWithAs<ButtonProps, 'button'>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    <Component
      ref={ref}
      aria-label={typeof children === 'string' ? children : undefined}
      disabled={disabled ?? (loading || success)}
      className={cn(
        buttonClass({
          size,
          variant,
          loading,
          className,
        }),
      )}
      {...props}
    >
      {leading &&
        leading({
          className: cn(iconClass({ size, leading: size }), {
            invisible: loading || success,
          }),
        })}
      {loading && (
        <span className="animate-in fade-in inline-flex items-center gap-x-0.5 h-5 absolute left-1/2 -translate-x-1/2">
          <span className="animate-blink mx-px h-1.5 w-1.5 rounded-full bg-white"></span>
          <span className="animate-blink animation-delay-150 mx-px h-1.5 w-1.5 rounded-full bg-white"></span>
          <span className="animate-blink animation-delay-300 mx-px h-1.5 w-1.5 rounded-full bg-white"></span>
        </span>
      )}
      {success && (
        <Check
          weight="bold"
          className="absolute w-5 h-5 -translate-x-1/2 left-1/2 animate-in fade-in"
        />
      )}
      <span
        className={cn({
          invisible: loading || success,
        })}
      >
        {children}
      </span>
      {trailing &&
        trailing({
          className: cn(iconClass({ size, trailing: size }), {
            invisible: loading || success,
          }),
        })}
    </Component>
  );
}

export const Button = forwardRefWithAs<ButtonProps, 'button'>(ButtonComponent);

const buttonClass = cva(
  'leading-none relative disabled:opacity-70 rounded-lg inline-flex tracking-wide transition focus:outline-2 focus:outline-offset-4 items-center active:scale-95',
  {
    variants: {
      variant: {
        primary:
          'bg-haptic-brand-700 hover:bg-haptic-brand-600 shadow-haptic-brand-900 hover:shadow-haptic-brand-800',
        danger:
          'bg-haptic-red-700 hover:bg-haptic-red-600 shadow-haptic-red-900 hover:shadow-haptic-red-800',
        plain: 'bg-white text-gray-700 shadow-haptic-gray-300 hover:shadow-haptic-gray-400',
        'danger-plain': 'bg-white text-red-600 shadow-haptic-gray-300 hover:shadow-haptic-gray-400',
        transparent: 'hover:bg-gray-100 text-gray-700',
        'danger-transparent': 'hover:bg-gray-100 text-red-600',
        'primary-subtle':
          'bg-haptic-brand-100 text-brand-700 hover:bg-haptic-brand-200 hover:text-brand-800 active:bg-haptic-brand-300',
        'danger-subtle':
          'bg-haptic-red-100 text-red-700 hover:bg-haptic-red-200 hover:text-red-800 active:bg-haptic-red-300',
        'plain-subtle': 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
      },
      size: {
        sm: 'py-2 sm:py-1 px-2.5',
        md: 'px-2.5 py-1.5',
        lg: 'px-4 py-2.5',
      },
      loading: {
        true: 'cursor-wait',
        false: 'disabled:cursor-not-allowed',
      },
    },
    compoundVariants: [
      {
        variant: ['primary', 'plain', 'transparent', 'primary-subtle', 'plain-subtle'],
        className: 'outline-brand-600',
      },
      {
        variant: ['danger', 'danger-plain', 'danger-transparent'],
        className: 'outline-red-600',
      },
      {
        variant: ['primary', 'danger'],
        className: 'text-white',
      },
      {
        variant: ['primary', 'plain'],
        className: 'shadow-sm',
      },
      {
        variant: ['plain', 'danger-plain', 'transparent', 'danger-transparent'],
        className: 'font-medium',
      },
      {
        size: ['sm', 'md'],
        className: 'text-sm',
      },
    ],
  },
);

const iconClass = cva('', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
    leading: {
      sm: 'mr-2',
      md: 'mr-2',
      lg: 'mr-3',
    },
    trailing: {
      sm: 'ml-2',
      md: 'ml-2',
      lg: 'ml-3',
    },
  },
});

type IconButtonProps = {
  icon?: (props: { className: string }) => React.ReactNode;
  label?: string;
  size?: VariantProps<typeof buttonClass>['size'];
  variant?: VariantProps<typeof buttonClass>['variant'];
  loading?: boolean;
  disabled?: boolean;
};

function IconButtonComponent(
  {
    icon,
    label,
    as: Component = 'button',
    size = 'md',
    variant = 'transparent',
    loading,
    disabled,
    className,
    ...props
  }: PropsWithAs<IconButtonProps, 'button'>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    <Tooltip disabled={label === undefined || disabled || loading}>
      <TooltipTrigger asChild>
        <div className="inline-flex">
          <Component
            ref={ref}
            disabled={disabled || loading}
            aria-disabled={disabled || loading}
            className={iconButtonClass({ size, variant, loading, className })}
            {...props}
          >
            {!loading &&
              icon &&
              icon({
                className: iconButtonIconClass({ size }),
              })}
            {loading && <Spinner className={iconButtonIconClass({ size })} />}
            <span className="sr-only">{label}</span>
          </Component>
        </div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export const IconButton = forwardRefWithAs<IconButtonProps, 'button'>(IconButtonComponent);

const baseIconButtonClass = cva('', {
  variants: {
    size: {
      sm: 'p-2 sm:p-1',
      md: 'p-3 sm:p-2',
      lg: 'p-4 sm:p-3',
    },
  },
});

function iconButtonClass({
  size,
  variant,
  loading,
  className,
}: {
  size: VariantProps<typeof baseIconButtonClass>['size'];
  variant?: VariantProps<typeof buttonClass>['variant'];
  loading?: boolean;
  className?: string;
}) {
  return cn(buttonClass({ variant, loading }), baseIconButtonClass({ size }), className);
}

const iconButtonIconClass = cva('', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
  },
});
