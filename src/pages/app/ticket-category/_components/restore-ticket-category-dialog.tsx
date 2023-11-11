import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { api } from '@/libs/api.lib';
import { APIResponseSchema } from '@/schemas/api.schema';
import { TicketCategory, TicketCategorySchema } from '@/schemas/ticket.schema';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type RestoreTicketCategoryDialogProps = {
  ticketCategoryId: TicketCategory['id'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function RestoreTicketCategoryDialog({
  ticketCategoryId,
  trigger,
  isOpen,
  onOpenChange,
}: RestoreTicketCategoryDialogProps) {
  const restoreTicketCategoryMutation = useRestoreTicketCategoryMutation({
    ticketCategoryId: ticketCategoryId,
  });

  return (
    <ConfirmationDialog
      id="restore-ticket-category"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Restore Ticket Category"
      description="Are you sure you want to restore this ticket category? After restoring, the
      ticket category will be listed in the ticket category list"
      isLoading={restoreTicketCategoryMutation.isPending}
      isSuccess={restoreTicketCategoryMutation.isSuccess}
      buttonLabel="Restore"
      buttonOnClick={() => restoreTicketCategoryMutation.mutate()}
      buttonLeadingIcon={(props) => <ArrowCounterClockwise {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const RestoreTicketCategoryResponseSchema = APIResponseSchema({
  schema: TicketCategorySchema.pick({
    id: true,
    name: true,
    description: true,
  }),
});

type UseRestoreTicketCategoryMutationParams = {
  ticketCategoryId: TicketCategory['id'];
};

function useRestoreTicketCategoryMutation({
  ticketCategoryId,
}: UseRestoreTicketCategoryMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/ticket-categories/${ticketCategoryId}/restore`);

        return RestoreTicketCategoryResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['ticket-category', 'index'] });
      await queryClient.invalidateQueries({
        queryKey: ['ticket-category', 'show', ticketCategoryId],
      });
    },
  });
}
