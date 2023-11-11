import * as React from 'react';
import { Channel, ChannelSchema } from '@/schemas/channel.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/libs/api.lib';
import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { Archive } from '@phosphor-icons/react';

type ArchiveChannelDialogProps = {
  channelId: Channel['id'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function ArchiveChannelDialog({
  channelId,
  trigger,
  isOpen,
  onOpenChange,
}: ArchiveChannelDialogProps) {
  const archiveChannelMutation = useArchiveChannelMutation({ channelId });

  return (
    <ConfirmationDialog
      id="archive-channel"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Archive Channel"
      description="Are you sure you want to archive this channel? After archiving the
      channel will not be listed in the channel list"
      destructive
      isLoading={archiveChannelMutation.isPending}
      isSuccess={archiveChannelMutation.isSuccess}
      buttonLabel="Archive"
      buttonOnClick={() => archiveChannelMutation.mutate()}
      buttonLeadingIcon={(props) => <Archive {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const ArchiveChannelResponseSchema = APIResponseSchema({
  schema: ChannelSchema.pick({
    id: true,
    name: true,
  }),
});

type UseArchiveChannelMutationParams = {
  channelId: Channel['id'];
};

function useArchiveChannelMutation({ channelId }: UseArchiveChannelMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/channels/${channelId}/archive`);

        return ArchiveChannelResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['channel', 'index'] });
      await queryClient.invalidateQueries({ queryKey: ['channel', 'show', channelId] });
    },
  });
}
