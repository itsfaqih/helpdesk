import { VariantProps, cva } from "class-variance-authority";
import { Check } from "@phosphor-icons/react";
import { cn } from "@/libs/cn.lib";
import { PropsWithAs, forwardRefWithAs } from "@/utils/as.util";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type ButtonProps = {
  size?: VariantProps<typeof buttonClass>["size"];
  variant?: VariantProps<typeof buttonClass>["variant"];
  leading?: React.ElementType;
  trailing?: React.ElementType;
  loading?: boolean;
  success?: boolean;
};

function ButtonComponent(
  {
    as: Component = "button",
    size = "md",
    variant = "transparent",
    leading: LeadingIcon,
    trailing: TrailingIcon,
    loading,
    success,
    disabled,
    className,
    children,
    ...props
  }: PropsWithAs<ButtonProps, "button">,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <Component
      ref={ref}
      aria-label={typeof children === "string" ? children : undefined}
      disabled={disabled ?? (loading || success)}
      className={cn(
        buttonClass({
          size,
          variant,
          loading,
          className,
        })
      )}
      {...props}
    >
      {LeadingIcon && (
        <LeadingIcon
          aria-hidden={true}
          className={iconClass({ size, leading: size })}
        />
      )}
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
      {TrailingIcon && (
        <TrailingIcon
          aria-hidden={true}
          className={iconClass({ size, trailing: size })}
        />
      )}
    </Component>
  );
}

export const Button = forwardRefWithAs<ButtonProps, "button">(ButtonComponent);

const buttonClass = cva(
  "relative disabled:opacity-70 rounded-md inline-flex font-medium tracking-wide active:scale-95 transition focus:outline-2 focus:outline-offset-4 items-center",
  {
    variants: {
      variant: {
        primary:
          "bg-haptic-brand-700 hover:bg-haptic-brand-800 shadow-haptic-brand-900 hover:shadow-haptic-brand-950",
        danger:
          "bg-haptic-red-700 hover:bg-haptic-red-800 outline-red-600 shadow-haptic-red-900 hover:shadow-haptic-red-950",
        white:
          "bg-white hover:bg-gray-100 text-gray-700 shadow-haptic-gray-300 hover:shadow-haptic-gray-400",
        transparent: "hover:bg-gray-100 text-gray-700",
      },
      size: {
        sm: "py-2 sm:py-1 px-2.5",
        md: "px-3.5 py-2",
        lg: "px-4 py-2.5",
      },
      loading: {
        true: "cursor-wait",
        false: "disabled:cursor-not-allowed",
      },
    },
    compoundVariants: [
      {
        variant: ["primary", "white", "transparent"],
        className: "outline-brand-600",
      },
      {
        variant: ["primary", "danger"],
        className: "text-white",
      },
      {
        variant: ["primary", "white"],
        className: "shadow-sm",
      },
      {
        size: ["sm", "md"],
        className: "text-sm",
      },
    ],
  }
);

const iconClass = cva("", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-4.5 w-4.5",
      lg: "h-5 w-5",
    },
    leading: {
      sm: "mr-2",
      md: "mr-2",
      lg: "mr-3",
    },
    trailing: {
      sm: "ml-2",
      md: "ml-2",
      lg: "ml-3",
    },
  },
});

type IconButtonProps = {
  icon?: React.ElementType;
  label?: string;
  size?: VariantProps<typeof buttonClass>["size"];
  variant?: VariantProps<typeof buttonClass>["variant"];
  loading?: boolean;
  disabled?: boolean;
};

function IconButtonComponent(
  {
    icon: Icon,
    label,
    as: Component = "button",
    size = "md",
    variant = "transparent",
    loading,
    disabled,
    className,
    ...props
  }: PropsWithAs<IconButtonProps, "button">,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <Tooltip disabled={disabled || loading}>
      <TooltipTrigger asChild>
        <div className="inline-flex">
          <Component
            ref={ref}
            disabled={disabled || loading}
            aria-disabled={disabled || loading}
            className={iconButtonClass({ size, variant, loading, className })}
            {...props}
          >
            {!loading && Icon && (
              <Icon weight="bold" className={iconButtonIconClass({ size })} />
            )}
            {loading && (
              <svg
                className={cn(
                  iconButtonIconClass({ size }),
                  "text-gray-700 animate-spin"
                )}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span className="sr-only">{label}</span>
          </Component>
        </div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export const IconButton = forwardRefWithAs<IconButtonProps, "button">(
  IconButtonComponent
);

const baseIconButtonClass = cva("", {
  variants: {
    size: {
      sm: "p-2 sm:p-1",
      md: "p-3 sm:p-2",
      lg: "p-4 sm:p-3",
    },
  },
});

function iconButtonClass({
  size,
  variant,
  loading,
  className,
}: {
  size: VariantProps<typeof baseIconButtonClass>["size"];
  variant?: VariantProps<typeof buttonClass>["variant"];
  loading?: boolean;
  className?: string;
}) {
  return cn(
    buttonClass({ variant, loading }),
    baseIconButtonClass({ size }),
    className
  );
}

const iconButtonIconClass = cva("", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    },
  },
});
