import { Toast, createToaster } from '@ark-ui/react';
import { CheckCircle, X, XCircle } from '@phosphor-icons/react';
import { IconButton } from './button';
import { cn } from '@/libs/cn.lib';

export const [Toaster, toast] = createToaster({
  placement: 'top-end',
  render(toast) {
    return (
      <Toast.Root
        className={cn(
          'bg-white shadow-menu px-3 py-1.5 rounded-lg',
          'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-right-4',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-right-4',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          {toast.type === 'success' && (
            <CheckCircle weight="fill" className="w-5 h-5 text-green-500" />
          )}
          {toast.type === 'error' && <XCircle weight="fill" className="w-5 h-5 text-red-500" />}
          <Toast.Title className="text-sm">{toast.title}</Toast.Title>
          <Toast.CloseTrigger>
            <IconButton icon={(props) => <X {...props} />} />
          </Toast.CloseTrigger>
        </div>
        {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
      </Toast.Root>
    );
  },
});
