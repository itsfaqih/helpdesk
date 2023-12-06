import { VariantProps, cva } from 'class-variance-authority';
import { Check } from '@phosphor-icons/react';
import { cn } from '@/libs/cn.lib';
import { PropsWithAs, forwardRefWithAs } from '@/utils/as.util';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { Spinner } from './spinner';

type ButtonProps = {
  size?: VariantProps<typeof buttonClass>['size'];
  variant?: VariantProps<typeof buttonClass>['variant'];
  severity?: VariantProps<typeof buttonClass>['severity'];
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
    severity = 'secondary',
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
      disabled={loading || success || disabled}
      className={cn(
        buttonClass({
          size,
          variant,
          severity,
          loading,
          className,
        }),
      )}
      {...props}
    >
      <div className="inline-flex tracking-wide leading-none items-center group-active:scale-95 transition-transform">
        {leading &&
          leading({
            className: cn(iconClass({ size, leading: size }), {
              invisible: loading || success,
            }),
          })}
        {loading && (
          <span className="animate-in fade-in inline-flex items-center gap-x-0.5 h-5 absolute left-1/2 -translate-x-1/2">
            <span
              className={cn('animate-blink mx-px h-1.5 w-1.5 rounded-full bg-white', {
                'bg-white': variant === 'filled' && severity !== 'secondary',
                'bg-brand-700': variant !== 'filled' && severity === 'primary',
                'bg-red-700': variant !== 'filled' && severity === 'danger',
                'bg-gray-700': severity === 'secondary',
              })}
            ></span>
            <span
              className={cn(
                'animate-blink animation-delay-150 mx-px h-1.5 w-1.5 rounded-full bg-white',
                {
                  'bg-white': variant === 'filled' && severity !== 'secondary',
                  'bg-brand-700': variant !== 'filled' && severity === 'primary',
                  'bg-red-700': variant !== 'filled' && severity === 'danger',
                  'bg-gray-700': severity === 'secondary',
                },
              )}
            ></span>
            <span
              className={cn(
                'animate-blink animation-delay-300 mx-px h-1.5 w-1.5 rounded-full bg-white',
                {
                  'bg-white': variant === 'filled' && severity !== 'secondary',
                  'bg-brand-700': variant !== 'filled' && severity === 'primary',
                  'bg-red-700': variant !== 'filled' && severity === 'danger',
                  'bg-gray-700': severity === 'secondary',
                },
              )}
            ></span>
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
      </div>
    </Component>
  );
}

export const Button = forwardRefWithAs<ButtonProps, 'button'>(ButtonComponent);

const buttonClass = cva(
  [
    'group inline-flex relative rounded-lg focus:outline-2 focus:outline-offset-4 items-center transition-all',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        filled: '',
        subtle: '',
        white: 'bg-white shadow-haptic-gray-300 hover:shadow-haptic-gray-400',
        transparent: 'enabled:hover:bg-gray-100 ',
      },
      severity: {
        primary: '',
        danger: 'outline-red-600',
        secondary: '',
      },
      size: {
        sm: 'py-2 sm:py-1 px-2.5',
        md: 'px-2.5 py-2',
        lg: 'px-4 py-2.5',
      },
      loading: {
        true: 'cursor-wait',
        false: 'disabled:cursor-not-allowed',
      },
    },
    compoundVariants: [
      {
        variant: ['filled'],
        severity: ['primary', 'danger'],
        className: 'text-white active:text-white/90',
      },
      {
        variant: ['filled'],
        severity: ['primary'],
        className:
          'bg-haptic-brand-700 enabled:hover:bg-haptic-brand-600 shadow-haptic-brand-900 enabled:hover:shadow-haptic-brand-800 enabled:active:shadow-inner-haptic-brand-900',
      },
      {
        variant: ['filled'],
        severity: ['danger'],
        className:
          'bg-haptic-red-700 enabled:hover:bg-haptic-red-600 shadow-haptic-red-900 enabled:hover:shadow-haptic-red-800 enabled:active:shadow-inner-haptic-red-900',
      },
      {
        variant: ['filled'],
        severity: ['secondary'],
        className:
          'bg-white text-gray-700 shadow-haptic-gray-300 enabled:hover:shadow-haptic-gray-400 enabled:active:shadow-inner-haptic-gray-300',
      },
      {
        variant: ['subtle'],
        severity: ['primary'],
        className:
          'bg-haptic-brand-100 text-brand-700 enabled:hover:bg-haptic-brand-200 enabled:hover:text-brand-800 enabled:active:bg-haptic-brand-300',
      },
      {
        variant: ['subtle'],
        severity: ['danger'],
        className:
          'bg-haptic-red-100 text-red-700 enabled:hover:bg-haptic-red-200 enabled:hover:text-red-800 enabled:active:bg-haptic-red-300',
      },
      {
        variant: ['subtle'],
        severity: ['secondary'],
        className: 'bg-gray-100 text-gray-700 enabled:hover:bg-gray-200 enabled:active:bg-gray-300',
      },
      {
        variant: ['transparent'],
        severity: ['primary'],
        className:
          'text-brand-700 hover:text-brand-800 enabled:hover:text-brand-800 enabled:active:text-brand-900',
      },
      {
        variant: ['transparent'],
        severity: ['danger'],
        className: 'text-red-600 enabled:hover:text-red-500 enabled:active:text-red-600/80',
      },
      {
        variant: ['transparent'],
        severity: ['secondary'],
        className: 'text-gray-700 enabled:hover:text-gray-800 enabled:active:text-gray-900/80',
      },
      {
        variant: ['white'],
        severity: ['primary'],
        className: 'text-brand-600 enabled:active:text-brand-600/80',
      },
      {
        variant: ['white'],
        severity: ['danger'],
        className: 'text-red-600 enabled:active:text-red-600/80',
      },
      {
        variant: ['white'],
        severity: ['secondary'],
        className: 'text-gray-700 enabled:active:text-gray-700/80',
      },
      {
        severity: ['primary', 'secondary'],
        className: 'outline-brand-600',
      },
      {
        variant: ['filled', 'white'],
        className: 'shadow-sm',
      },
      {
        variant: ['white', 'transparent'],
        className: 'font-medium enabled:active:shadow-inner-haptic-gray-300',
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
  tooltip?: string;
  disabledTooltip?: string;
  size?: VariantProps<typeof buttonClass>['size'];
  variant?: VariantProps<typeof buttonClass>['variant'];
  severity?: VariantProps<typeof buttonClass>['severity'];
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  containerClassName?: string;
};

function IconButtonComponent(
  {
    icon,
    label,
    tooltip,
    disabledTooltip,
    as: Component = 'button',
    size = 'md',
    variant = 'transparent',
    severity = 'secondary',
    loading,
    success,
    disabled,
    className,
    containerClassName,
    ...props
  }: PropsWithAs<IconButtonProps, 'button'>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    <Tooltip
      disabled={
        (tooltip === undefined && disabledTooltip === undefined) ||
        (disabled && !disabledTooltip) ||
        loading
      }
    >
      <TooltipTrigger asChild>
        <div className={cn('inline-flex', containerClassName)}>
          <Component
            ref={ref}
            disabled={loading || success || disabled}
            aria-label={label}
            aria-disabled={disabled || loading}
            className={iconButtonClass({ size, variant, severity, loading, className })}
            {...props}
          >
            {!loading &&
              icon &&
              icon({
                className: iconButtonIconClass({ size }),
              })}
            {loading && <Spinner className={iconButtonIconClass({ size })} />}

            {success && (
              <Check
                weight="bold"
                className="absolute w-5 h-5 -translate-x-1/2 left-1/2 animate-in fade-in"
              />
            )}
          </Component>
        </div>
      </TooltipTrigger>
      <TooltipContent>{disabled ? disabledTooltip : tooltip}</TooltipContent>
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
  severity,
  loading,
  className,
}: {
  size: VariantProps<typeof baseIconButtonClass>['size'];
  variant?: VariantProps<typeof buttonClass>['variant'];
  severity?: VariantProps<typeof buttonClass>['severity'];
  loading?: boolean;
  className?: string;
}) {
  return cn(buttonClass({ variant, severity, loading }), baseIconButtonClass({ size }), className);
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
