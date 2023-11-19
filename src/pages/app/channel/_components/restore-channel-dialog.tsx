import { api } from '@/libs/api.lib';
import { APIResponseSchema } from '@/schemas/api.schema';
import { Channel, ChannelSchema } from '@/schemas/channel.schema';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import * as React from 'react';
import { ConfirmationDialog } from '@/components/derived/confirmation-dialog';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { toast } from '@/components/base/toast';

type RestoreChannelDialogProps = {
  channelId: Channel['id'];
  channelName: Channel['name'];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function RestoreChannelDialog({
  channelId,
  channelName,
  trigger,
  isOpen,
  onOpenChange,
}: RestoreChannelDialogProps) {
  const restoreChannelMutation = useRestoreChannelMutation({ channelId });

  return (
    <ConfirmationDialog
      id="restore-channel"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`Restore ${channelName}`}
      description="Are you sure you want to restore this channel? After restoring the
    channel will be listed in the channel list"
      isLoading={restoreChannelMutation.isPending}
      isSuccess={restoreChannelMutation.isSuccess}
      buttonLabel="Restore"
      buttonOnClick={() => restoreChannelMutation.mutate()}
      buttonLeadingIcon={(props) => <ArrowCounterClockwise {...props} />}
      trigger={trigger}
      onSuccess={() => {
        onOpenChange?.(false);
      }}
    />
  );
}

const RestoreChannelResponseSchema = APIResponseSchema({
  schema: ChannelSchema.pick({
    id: true,
    name: true,
  }),
});

type UseRestoreChannelMutationParams = {
  channelId: Channel['id'];
};

function useRestoreChannelMutation({ channelId }: UseRestoreChannelMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/channels/${channelId}/restore`);

        return RestoreChannelResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      toast.create({
        title: 'Channel restored successfully',
        type: 'success',
      });

      await queryClient.invalidateQueries({ queryKey: ['channel', 'index'] });
      await queryClient.invalidateQueries({ queryKey: ['channel', 'show', channelId] });
    },
  });
}
