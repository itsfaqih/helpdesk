import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { api } from '@/libs/api.lib';
import { User, UserSchema } from '@/schemas/user.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { Power } from '@phosphor-icons/react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from '@/components/base/toast';

type DeactivateUserDialogProps = {
  userId: User['id'];
  userFullName: User['full_name'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function DeactivateUserDialog({
  userId,
  userFullName,
  trigger,
  isOpen,
  onOpenChange,
}: DeactivateUserDialogProps) {
  const deactivateUserMutation = useDeactivateUserMutation({ userId });

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`Deactivate ${userFullName}`}
      description="Are you sure you want to deactivate this user? After deactivating,
      the user will not be able to login to the system"
      destructive
      isLoading={deactivateUserMutation.isPending}
      isSuccess={deactivateUserMutation.isSuccess}
      buttonLabel="Deactivate"
      buttonOnClick={() => deactivateUserMutation.mutate()}
      buttonLeadingIcon={(props) => <Power {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const DeactivateUserResponseSchema = APIResponseSchema({
  schema: UserSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
    is_archived: true,
  }),
});

type UseDeactivateUserMutationParams = {
  userId: User['id'];
};

function useDeactivateUserMutation({ userId }: UseDeactivateUserMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/users/${userId}/deactivate`);

        return DeactivateUserResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      toast.create({
        title: 'User deactivated successfully',
        type: 'success',
      });

      await queryClient.invalidateQueries({ queryKey: ['user', 'index'] });
      await queryClient.invalidateQueries({ queryKey: ['user', 'show', userId] });
    },
  });
}
