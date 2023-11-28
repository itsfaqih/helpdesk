import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { api } from '@/libs/api.lib';
import { User, UserSchema } from '@/schemas/user.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { useQueryClient, useMutation } from '@tanstack/react-query';

type RestoreUserDialogProps = {
  userId: User['id'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function RestoreUserDialog({
  userId,
  trigger,
  isOpen,
  onOpenChange,
}: RestoreUserDialogProps) {
  const restoreUserMutation = useRestoreUserMutation({ userId });

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Restore User"
      description="Are you sure you want to restore this user? After restoring
      the user will be listed in any action related to users"
      isLoading={restoreUserMutation.isPending}
      isSuccess={restoreUserMutation.isSuccess}
      buttonLabel="Restore"
      buttonOnClick={() => restoreUserMutation.mutate()}
      buttonLeadingIcon={(props) => <ArrowCounterClockwise {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const RestoreUserResponseSchema = APIResponseSchema({
  schema: UserSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
    is_archived: true,
  }),
});

type UseRestoreUserMutationParams = {
  userId: User['id'];
};

function useRestoreUserMutation({ userId }: UseRestoreUserMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/users/${userId}/restore`);

        return RestoreUserResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['user', 'index'] });
      await queryClient.invalidateQueries({ queryKey: ['user', 'show', userId] });
    },
  });
}
