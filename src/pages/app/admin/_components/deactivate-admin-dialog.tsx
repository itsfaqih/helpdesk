import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { api } from '@/libs/api.lib';
import { Admin, AdminSchema } from '@/schemas/admin.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { Power } from '@phosphor-icons/react';
import { useQueryClient, useMutation } from '@tanstack/react-query';

type DeactivateAdminDialogProps = {
  adminId: Admin['id'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function DeactivateAdminDialog({
  adminId,
  trigger,
  isOpen,
  onOpenChange,
}: DeactivateAdminDialogProps) {
  const deactivateAdminMutation = useDeactivateAdminMutation({ adminId });

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Deactivate Admin"
      description="Are you sure you want to deactivate this admin? After deactivating,
      the admin will not be able to login to the system"
      destructive
      isLoading={deactivateAdminMutation.isPending}
      isSuccess={deactivateAdminMutation.isSuccess}
      buttonLabel="Deactivate Admin"
      buttonOnClick={() => deactivateAdminMutation.mutate()}
      buttonLeadingIcon={(props) => <Power {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const DeactivateAdminResponseSchema = APIResponseSchema({
  schema: AdminSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

type UseDeactivateAdminMutationParams = {
  adminId: Admin['id'];
};

function useDeactivateAdminMutation({ adminId }: UseDeactivateAdminMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/admins/${adminId}/deactivate`);

        return DeactivateAdminResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'index'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'show', adminId] });
    },
  });
}
