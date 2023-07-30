import { ConfirmationDialog } from "@/components/derived/confirmation-dialog";
import { api } from "@/libs/api.lib";
import { APIResponseSchema } from "@/schemas/api.schema";
import { Client, ClientSchema } from "@/schemas/client.schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";

type RestoreClientDialogProps = {
  clientId: Client["id"];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function RestoreClientDialog({
  clientId,
  trigger,
  isOpen,
  onOpenChange,
}: RestoreClientDialogProps) {
  const restoreClientMutation = useRestoreClientMutation({ clientId });

  return (
    <ConfirmationDialog
      id="restore-client"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Restore Client"
      description="Are you sure you want to restore this client? After archiving, the
      client will be listed in the client list"
      isLoading={restoreClientMutation.isLoading}
      isSuccess={restoreClientMutation.isSuccess}
      buttonLabel="Restore Client"
      buttonOnClick={() => restoreClientMutation.mutate()}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const RestoreClientResponseSchema = APIResponseSchema({
  schema: ClientSchema.pick({
    id: true,
    full_name: true,
  }),
});

type UseRestoreClientMutationParams = {
  clientId: Client["id"];
};

function useRestoreClientMutation({
  clientId,
}: UseRestoreClientMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/clients/${clientId}/restore`);

        return RestoreClientResponseSchema.parse(res);
      } catch (error) {
        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["client", "index"]);
      await queryClient.invalidateQueries(["client", "show", clientId]);
    },
  });
}
