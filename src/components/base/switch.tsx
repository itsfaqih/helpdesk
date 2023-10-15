import * as React from 'react';
import { Switch as ArkSwitch } from '@ark-ui/react';

export const Switch = ArkSwitch.Root;

export const SwitchLabel = ArkSwitch.Label;

export const SwitchControl = React.forwardRef<
  React.ElementRef<typeof ArkSwitch.Control>,
  React.ComponentPropsWithoutRef<typeof ArkSwitch.Control>
>(() => {
  return <ArkSwitch.Control />;
});

SwitchControl.displayName = ArkSwitch.Control.displayName;

export const SwitchThumb = React.forwardRef<
  React.ElementRef<typeof ArkSwitch.Thumb>,
  React.ComponentPropsWithoutRef<typeof ArkSwitch.Thumb>
>(() => {
  return <ArkSwitch.Thumb />;
});

SwitchThumb.displayName = ArkSwitch.Thumb.displayName;
