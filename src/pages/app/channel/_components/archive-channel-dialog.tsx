import React from "react";
import { Channel, ChannelSchema } from "@/schemas/channel.schema";
import { APIResponseSchema } from "@/schemas/api.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/api.lib";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/base/dialog";
import { Button } from "@/components/base/button";

type ArchiveChannelDialogProps = {
  channelId: Channel["id"];
  trigger: React.ReactNode;
};

export function ArchiveChannelDialog({
  channelId,
  trigger,
}: ArchiveChannelDialogProps) {
  const [open, setOpen] = React.useState(false);

  const archiveChannelMutation = useArchiveChannelMutation({ channelId });

  React.useEffect(() => {
    if (archiveChannelMutation.isSuccess) {
      setOpen(false);
    }
  }, [archiveChannelMutation.isSuccess]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[36rem]">
        <DialogHeader>
          <DialogTitle>Archive Channel</DialogTitle>
          <DialogDescription>
            Are you sure you want to archive this channel? After archiving, the
            channel will not be listed in the channel list
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5">
          <Button
            type="button"
            variant="danger"
            loading={archiveChannelMutation.isLoading}
            success={archiveChannelMutation.isSuccess}
            onClick={() => archiveChannelMutation.mutate()}
          >
            Archive Channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ArchiveChannelResponseSchema = APIResponseSchema({
  schema: ChannelSchema.pick({
    id: true,
    name: true,
  }),
});

type UseArchiveChannelMutationParams = {
  channelId: Channel["id"];
};

function useArchiveChannelMutation({
  channelId,
}: UseArchiveChannelMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/channels/${channelId}/archive`);

        return ArchiveChannelResponseSchema.parse(res);
      } catch (error) {
        throw new Error(
          "Something went wrong. Please contact the administrator"
        );
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["channel", "index"]);
      await queryClient.invalidateQueries(["channel", "show", channelId, {}]);
    },
  });
}
