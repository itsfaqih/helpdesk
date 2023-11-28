import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { api } from '@/libs/api.lib';
import { User, UserSchema } from '@/schemas/user.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { Power } from '@phosphor-icons/react';
import { useQueryClient, useMutation } from '@tanstack/react-query';

type ActivateUserDialogProps = {
  userId: User['id'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function ActivateUserDialog({
  userId,
  trigger,
  isOpen,
  onOpenChange,
}: ActivateUserDialogProps) {
  const activateUserMutation = useActivateUserMutation({ userId });

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Activate User"
      description="Are you sure you want to activate this user? After activating
      the user will be able to login to the system"
      isLoading={activateUserMutation.isPending}
      isSuccess={activateUserMutation.isSuccess}
      buttonLabel="Activate"
      buttonOnClick={() => activateUserMutation.mutate()}
      buttonLeadingIcon={(props) => <Power {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const ActivateUserResponseSchema = APIResponseSchema({
  schema: UserSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
    is_archived: true,
  }),
});

type UseActivateUserMutationParams = {
  userId: User['id'];
};

function useActivateUserMutation({ userId }: UseActivateUserMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/users/${userId}/activate`);

        return ActivateUserResponseSchema.parse(res);
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
