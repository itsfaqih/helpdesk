import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { api } from '@/libs/api.lib';
import { User, UserSchema } from '@/schemas/user.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { Archive } from '@phosphor-icons/react';
import { useQueryClient, useMutation } from '@tanstack/react-query';

type ArchiveUserDialogProps = {
  userId: User['id'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function ArchiveUserDialog({
  userId,
  trigger,
  isOpen,
  onOpenChange,
}: ArchiveUserDialogProps) {
  const archiveUserMutation = useArchiveUserMutation({ userId });

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Archive User"
      description="Are you sure you want to archive this user? After archiving
      the user will not have any access to the system and will not be listed in any action related to users"
      destructive
      isLoading={archiveUserMutation.isPending}
      isSuccess={archiveUserMutation.isSuccess}
      buttonLabel="Archive"
      buttonOnClick={() => archiveUserMutation.mutate()}
      buttonLeadingIcon={(props) => <Archive {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const ArchiveUserResponseSchema = APIResponseSchema({
  schema: UserSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
    is_archived: true,
  }),
});

type UseArchiveUserMutationParams = {
  userId: User['id'];
};

function useArchiveUserMutation({ userId }: UseArchiveUserMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/users/${userId}/archive`);

        return ArchiveUserResponseSchema.parse(res);
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
