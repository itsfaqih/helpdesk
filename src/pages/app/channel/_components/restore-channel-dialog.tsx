import { api } from "@/libs/api.lib";
import { APIResponseSchema } from "@/schemas/api.schema";
import { Channel, ChannelSchema } from "@/schemas/channel.schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import React from "react";
import { ConfirmationDialog } from "@/components/derived/confirmation-dialog";

type RestoreChannelDialogProps = {
  channelId: Channel["id"];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function RestoreChannelDialog({
  channelId,
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
      title="Restore Channel"
      description="Are you sure you want to restore this channel? After restoring the
    channel will be listed in the channel list"
      isLoading={restoreChannelMutation.isLoading}
      isSuccess={restoreChannelMutation.isSuccess}
      buttonLabel="Restore Channel"
      buttonOnClick={() => restoreChannelMutation.mutate()}
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
  channelId: Channel["id"];
};

function useRestoreChannelMutation({
  channelId,
}: UseRestoreChannelMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/channels/${channelId}/restore`);

        return RestoreChannelResponseSchema.parse(res);
      } catch (error) {
        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["channel", "index"]);
      await queryClient.invalidateQueries(["channel", "show", channelId]);
    },
  });
}
