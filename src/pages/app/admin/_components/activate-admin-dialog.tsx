import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { api } from '@/libs/api.lib';
import { Admin, AdminSchema } from '@/schemas/admin.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { Power } from '@phosphor-icons/react';
import { useQueryClient, useMutation } from '@tanstack/react-query';

type ActivateAdminDialogProps = {
  adminId: Admin['id'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function ActivateAdminDialog({
  adminId,
  trigger,
  isOpen,
  onOpenChange,
}: ActivateAdminDialogProps) {
  const activateAdminMutation = useActivateAdminMutation({ adminId });

  return (
    <ConfirmationDialog
      id="activate-admin"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Reactivate Admin"
      description="Are you sure you want to activate this admin? After activating
      the admin will be able to login to the system"
      isLoading={activateAdminMutation.isPending}
      isSuccess={activateAdminMutation.isSuccess}
      buttonLabel="Activate"
      buttonOnClick={() => activateAdminMutation.mutate()}
      buttonLeadingIcon={(props) => <Power {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const ActivateAdminResponseSchema = APIResponseSchema({
  schema: AdminSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

type UseActivateAdminMutationParams = {
  adminId: Admin['id'];
};

function useActivateAdminMutation({ adminId }: UseActivateAdminMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/admins/${adminId}/activate`);

        return ActivateAdminResponseSchema.parse(res);
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
