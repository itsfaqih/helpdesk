import { ConfirmationDialog } from "@/components/derived/confirmation-dialog";
import { api } from "@/libs/api.lib";
import { Admin, AdminSchema } from "@/schemas/admin.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";

type ReactivateAdminDialogProps = {
  adminId: Admin["id"];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function ReactivateAdminDialog({
  adminId,
  trigger,
  isOpen,
  onOpenChange,
}: ReactivateAdminDialogProps) {
  const reactivateAdminMutation = useReactivateAdminMutation({ adminId });

  return (
    <ConfirmationDialog
      id="reactivate-admin"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Reactivate Admin"
      description="Are you sure you want to reactivate this admin? After reactivating
      the admin will be able to login to the system"
      isLoading={reactivateAdminMutation.isLoading}
      isSuccess={reactivateAdminMutation.isSuccess}
      buttonLabel="Reactivate Admin"
      buttonOnClick={() => reactivateAdminMutation.mutate()}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const ReactivateAdminResponseSchema = APIResponseSchema({
  schema: AdminSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
  }),
});

type UseReactivateAdminMutationParams = {
  adminId: Admin["id"];
};

function useReactivateAdminMutation({
  adminId,
}: UseReactivateAdminMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/admins/${adminId}/activate`);

        return ReactivateAdminResponseSchema.parse(res);
      } catch (error) {
        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["admin", "index"]);
      await queryClient.invalidateQueries(["admin", "show", adminId]);
    },
  });
}
