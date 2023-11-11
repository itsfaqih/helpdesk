import { api } from '@/libs/api.lib';
import { APIResponseSchema } from '@/schemas/api.schema';
import { Action, ActionSchema } from '@/schemas/action.schema';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import * as React from 'react';
import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { ArrowCounterClockwise } from '@phosphor-icons/react';

type RestoreActionDialogProps = {
  actionId: Action['id'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function RestoreActionDialog({
  actionId,
  trigger,
  isOpen,
  onOpenChange,
}: RestoreActionDialogProps) {
  const restoreActionMutation = useRestoreActionMutation({ actionId });

  return (
    <ConfirmationDialog
      id="restore-action"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Restore Action"
      description="Are you sure you want to restore this action? After restoring the
    action will be listed in the action list"
      isLoading={restoreActionMutation.isPending}
      isSuccess={restoreActionMutation.isSuccess}
      buttonLabel="Restore"
      buttonOnClick={() => restoreActionMutation.mutate()}
      buttonLeadingIcon={(props) => <ArrowCounterClockwise {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const RestoreActionResponseSchema = APIResponseSchema({
  schema: ActionSchema.pick({
    id: true,
    name: true,
  }),
});

type UseRestoreActionMutationParams = {
  actionId: Action['id'];
};

function useRestoreActionMutation({ actionId }: UseRestoreActionMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/actions/${actionId}/restore`);

        return RestoreActionResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['action', 'index'] });
      await queryClient.invalidateQueries({ queryKey: ['action', 'show', actionId] });
    },
  });
}
