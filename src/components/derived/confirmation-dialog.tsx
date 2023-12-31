import * as React from 'react';
import { Button } from '../base/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../base/dialog';

type ConfirmationDialogProps = {
  title: string;
  description: string;
  buttonLabel: string;
  buttonOnClick: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  buttonLeadingIcon?: React.ComponentPropsWithoutRef<typeof Button>['leading'];
  destructive?: boolean;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onSuccess?: () => void;
};

export function ConfirmationDialog({
  title,
  description,
  buttonLabel,
  buttonOnClick,
  isLoading,
  isSuccess,
  buttonLeadingIcon,
  destructive,
  trigger,
  isOpen,
  onOpenChange,
  onSuccess,
}: ConfirmationDialogProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  return (
    <Dialog
      open={isOpen ?? open}
      onOpenChange={({ open }) => {
        if (onOpenChange) {
          onOpenChange(open);
        } else {
          setOpen(open);
        }
      }}
    >
      {Boolean(trigger) && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="w-[36rem]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5">
          <Button
            type="button"
            leading={buttonLeadingIcon}
            variant="filled"
            severity={destructive ? 'danger' : 'primary'}
            loading={isLoading}
            success={isSuccess}
            onClick={buttonOnClick}
          >
            {buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
