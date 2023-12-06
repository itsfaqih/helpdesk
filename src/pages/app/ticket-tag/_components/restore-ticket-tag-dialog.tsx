import { toast } from '@/components/base/toast';
import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { api } from '@/libs/api.lib';
import { APIResponseSchema } from '@/schemas/api.schema';
import { TicketTag, TicketTagSchema } from '@/schemas/ticket.schema';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type RestoreTicketTagDialogProps = {
  ticketTagId: TicketTag['id'];
  ticketTagName: TicketTag['name'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function RestoreTicketTagDialog({
  ticketTagId,
  ticketTagName,
  trigger,
  isOpen,
  onOpenChange,
}: RestoreTicketTagDialogProps) {
  const restoreTicketTagMutation = useRestoreTicketTagMutation({
    ticketTagId: ticketTagId,
  });

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`Restore ${ticketTagName}`}
      description="Are you sure you want to restore this ticket tag? After restoring, the
      ticket tag will be listed in the ticket tag list"
      isLoading={restoreTicketTagMutation.isPending}
      isSuccess={restoreTicketTagMutation.isSuccess}
      buttonLabel="Restore"
      buttonOnClick={() => restoreTicketTagMutation.mutate()}
      buttonLeadingIcon={(props) => <ArrowCounterClockwise {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const RestoreTicketTagResponseSchema = APIResponseSchema({
  schema: TicketTagSchema.pick({
    id: true,
    name: true,
    description: true,
  }),
});

type UseRestoreTicketTagMutationParams = {
  ticketTagId: TicketTag['id'];
};

function useRestoreTicketTagMutation({ ticketTagId }: UseRestoreTicketTagMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/ticket-tags/${ticketTagId}/restore`);

        return RestoreTicketTagResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      toast.create({
        title: 'Ticket tag restored successfully',
        type: 'success',
      });

      await queryClient.invalidateQueries({ queryKey: ['ticket-tag', 'index'] });
      await queryClient.invalidateQueries({
        queryKey: ['ticket-tag', 'show', ticketTagId],
      });
    },
  });
}
