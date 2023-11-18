import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { api } from '@/libs/api.lib';
import { APIResponseSchema } from '@/schemas/api.schema';
import { TicketTag, TicketTagSchema } from '@/schemas/ticket.schema';
import { Archive } from '@phosphor-icons/react';
import { useQueryClient, useMutation } from '@tanstack/react-query';

type ArchiveTicketTagDialogProps = {
  ticketTagId: TicketTag['id'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function ArchiveTicketTagDialog({
  ticketTagId,
  trigger,
  isOpen,
  onOpenChange,
}: ArchiveTicketTagDialogProps) {
  const archiveTicketTagMutation = useArchiveTicketTagMutation({
    ticketTagId,
  });

  return (
    <ConfirmationDialog
      id="archive-ticket-tag"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Archive Ticket tag"
      description="Are you sure you want to archive this ticket tag? After archiving, the
      ticket tag will no longer be listed in the ticket tag list"
      destructive
      isLoading={archiveTicketTagMutation.isPending}
      isSuccess={archiveTicketTagMutation.isSuccess}
      buttonLabel="Archive"
      buttonOnClick={() => archiveTicketTagMutation.mutate()}
      buttonLeadingIcon={(props) => <Archive {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const ArchiveTicketTagResponseSchema = APIResponseSchema({
  schema: TicketTagSchema.pick({
    id: true,
    name: true,
    description: true,
  }),
});

type UseArchiveTicketTagMutationParams = {
  ticketTagId: TicketTag['id'];
};

function useArchiveTicketTagMutation({ ticketTagId }: UseArchiveTicketTagMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/ticket-tags/${ticketTagId}/archive`);

        return ArchiveTicketTagResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['ticket-tag', 'index'] });
      await queryClient.invalidateQueries({
        queryKey: ['ticket-tag', 'show', ticketTagId],
      });
    },
  });
}
