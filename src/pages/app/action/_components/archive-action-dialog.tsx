import React from 'react';
import { Action, ActionSchema } from '@/schemas/action.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/libs/api.lib';
import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { Archive } from '@phosphor-icons/react';

type ArchiveActionDialogProps = {
  actionId: Action['id'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function ArchiveActionDialog({
  actionId,
  trigger,
  isOpen,
  onOpenChange,
}: ArchiveActionDialogProps) {
  const archiveActionMutation = useArchiveActionMutation({
    actionId: actionId,
  });

  return (
    <ConfirmationDialog
      id="archive-action"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Archive Action"
      description="Are you sure you want to archive this action? After archiving the
      action will not be listed in the action list"
      destructive
      isLoading={archiveActionMutation.isLoading}
      isSuccess={archiveActionMutation.isSuccess}
      buttonLabel="Archive"
      buttonOnClick={() => archiveActionMutation.mutate()}
      buttonLeadingIcon={(props) => <Archive {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const ArchiveActionResponseSchema = APIResponseSchema({
  schema: ActionSchema.pick({
    id: true,
    name: true,
  }),
});

type UseArchiveActionMutationParams = {
  actionId: Action['id'];
};

function useArchiveActionMutation({ actionId }: UseArchiveActionMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/actions/${actionId}/archive`);

        return ArchiveActionResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['action', 'index']);
      await queryClient.invalidateQueries(['action', 'show', actionId]);
    },
  });
}
