import { Button } from "@/components/base/button";
import { DialogHeader, DialogFooter } from "@/components/base/dialog";
import { api } from "@/libs/api.lib";
import { APIResponseSchema } from "@/schemas/api.schema";
import { Channel, ChannelSchema } from "@/schemas/channel.schema";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/base/dialog";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import React from "react";

type RestoreChannelDialogProps = {
  channelId: Channel["id"];
  trigger?: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
};

export function RestoreChannelDialog({
  channelId,
  trigger,
  isOpen,
  setIsOpen,
}: RestoreChannelDialogProps) {
  const [open, setOpen] = React.useState(false);

  const restoreChannelMutation = useRestoreChannelMutation({ channelId });

  React.useEffect(() => {
    if (restoreChannelMutation.isSuccess) {
      if (setIsOpen) {
        setIsOpen(false);
      } else {
        setOpen(false);
      }
    }
  }, [setIsOpen, restoreChannelMutation.isSuccess]);

  return (
    <Dialog
      open={isOpen ?? open}
      onClose={() => {
        if (setIsOpen) {
          setIsOpen(false);
        } else {
          setOpen(false);
        }
      }}
      onOpen={() => {
        if (setIsOpen) {
          setIsOpen(true);
        } else {
          setOpen(true);
        }
      }}
    >
      {Boolean(trigger) && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="w-[36rem]">
        <DialogHeader>
          <DialogTitle>Restore Channel</DialogTitle>
          <DialogDescription>
            Are you sure you want to restore this channel? After restoring the
            channel will be listed in the channel list
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5">
          <Button
            type="button"
            variant="primary"
            loading={restoreChannelMutation.isLoading}
            success={restoreChannelMutation.isSuccess}
            onClick={() => restoreChannelMutation.mutate()}
          >
            Restore Channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const RestoreChannelResponseSchema = APIResponseSchema({
  schema: ChannelSchema.pick({
    id: true,
    email: true,
    full_name: true,
    role: true,
    is_active: true,
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
      await queryClient.invalidateQueries(["channel", "show", channelId, {}]);
    },
  });
}
