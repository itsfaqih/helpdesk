import { api } from '@/libs/api.lib';
import { APIResponseSchema } from '@/schemas/api.schema';
import { Action, ActionSchema } from '@/schemas/action.schema';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

type EnableActionButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  actionId: Action['id'];
  asChild?: boolean;
  onClick?: React.MouseEventHandler<unknown>;
};

export function EnableActionButton({
  actionId,
  asChild,
  onClick,
  ...props
}: EnableActionButtonProps) {
  const Comp = asChild ? Slot : 'button';

  const enableActionMutation = useEnableActionMutation({ actionId });

  return (
    <Comp
      {...props}
      onClick={(e) => {
        enableActionMutation.mutate();
        onClick?.(e);
      }}
      data-loading={enableActionMutation.isPending}
    />
  );
}

const EnableActionResponseSchema = APIResponseSchema({
  schema: ActionSchema.pick({
    id: true,
    name: true,
  }),
});

type UseEnableActionMutationParams = {
  actionId: Action['id'];
};

function useEnableActionMutation({ actionId }: UseEnableActionMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/actions/${actionId}/enable`);

        return EnableActionResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['action', 'index'] });
      await queryClient.invalidateQueries({ queryKey: ['action', 'show', actionId] });
    },
  });
}
