import { ConfirmationDialog } from "@/components/derived/confirmation-dialog";
import { api } from "@/libs/api.lib";
import { APIResponseSchema } from "@/schemas/api.schema";
import { Client, ClientSchema } from "@/schemas/client.schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";

type ArchiveClientDialogProps = {
  clientId: Client["id"];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function ArchiveClientDialog({
  clientId,
  trigger,
  isOpen,
  onOpenChange,
}: ArchiveClientDialogProps) {
  const archiveClientMutation = useArchiveClientMutation({ clientId });

  return (
    <ConfirmationDialog
      id="archive-client"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Archive Client"
      description="Are you sure you want to archive this client? After archiving, the
      client will not be listed in the client list"
      destructive
      isLoading={archiveClientMutation.isLoading}
      isSuccess={archiveClientMutation.isSuccess}
      buttonLabel="Archive Client"
      buttonOnClick={() => archiveClientMutation.mutate()}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const ArchiveClientResponseSchema = APIResponseSchema({
  schema: ClientSchema.pick({
    id: true,
    full_name: true,
  }),
});

type UseArchiveClientMutationParams = {
  clientId: Client["id"];
};

function useArchiveClientMutation({
  clientId,
}: UseArchiveClientMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/clients/${clientId}/archive`);

        return ArchiveClientResponseSchema.parse(res);
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