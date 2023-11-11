import * as React from 'react';
import * as Ark from '@ark-ui/react';

import { cn } from '@/libs/cn.lib';

export const Avatar = React.forwardRef<
  React.ElementRef<typeof Ark.Avatar>,
  React.ComponentPropsWithoutRef<typeof Ark.Avatar>
>(({ className, ...props }, ref) => (
  <Ark.Avatar
    ref={ref}
    className={cn(
      'flex h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-haptic-gray-300',
      className,
    )}
    {...props}
  />
));

Avatar.displayName = Ark.Avatar.displayName;

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof Ark.AvatarImage>,
  React.ComponentPropsWithoutRef<typeof Ark.AvatarImage>
>(({ className, ...props }, ref) => (
  <Ark.AvatarImage ref={ref} className={cn('aspect-square h-full w-full', className)} {...props} />
));

AvatarImage.displayName = Ark.AvatarImage.displayName;

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof Ark.AvatarFallback>,
  React.ComponentPropsWithoutRef<typeof Ark.AvatarFallback>
>(({ className, ...props }, ref) => (
  <Ark.AvatarFallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-white',
      className,
    )}
    {...props}
  />
));

AvatarFallback.displayName = Ark.AvatarFallback.displayName;
