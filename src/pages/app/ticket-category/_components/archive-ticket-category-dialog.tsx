import { ConfirmationDialog } from "@/components/derived/confirmation-dialog";
import { api } from "@/libs/api.lib";
import { APIResponseSchema } from "@/schemas/api.schema";
import { TicketCategory, TicketCategorySchema } from "@/schemas/ticket.schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";

type ArchiveTicketCategoryDialogProps = {
  ticketCategoryId: TicketCategory["id"];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function ArchiveTicketCategoryDialog({
  ticketCategoryId,
  trigger,
  isOpen,
  onOpenChange,
}: ArchiveTicketCategoryDialogProps) {
  const archiveTicketCategoryMutation = useArchiveTicketCategoryMutation({
    ticketCategoryId,
  });

  return (
    <ConfirmationDialog
      id="archive-ticket-category"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Archive Ticket Category"
      description="Are you sure you want to archive this ticket category? After archiving, the
      ticket category will no longer be listed in the ticket category list"
      destructive
      isLoading={archiveTicketCategoryMutation.isLoading}
      isSuccess={archiveTicketCategoryMutation.isSuccess}
      buttonLabel="Archive"
      buttonOnClick={() => archiveTicketCategoryMutation.mutate()}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const ArchiveTicketCategoryResponseSchema = APIResponseSchema({
  schema: TicketCategorySchema.pick({
    id: true,
    name: true,
    description: true,
  }),
});

type UseArchiveTicketCategoryMutationParams = {
  ticketCategoryId: TicketCategory["id"];
};

function useArchiveTicketCategoryMutation({
  ticketCategoryId,
}: UseArchiveTicketCategoryMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(
          undefined,
          `/ticket-categories/${ticketCategoryId}/archive`
        );

        return ArchiveTicketCategoryResponseSchema.parse(res);
      } catch (error) {
        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["ticket-category", "index"]);
			await queryClient.invalidateQueries(["ticket-category", "show", ticketCategoryId]);
    },
  });
}
