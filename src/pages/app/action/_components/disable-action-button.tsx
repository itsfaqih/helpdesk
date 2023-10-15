import { Action, ActionSchema } from '@/schemas/action.schema';
import { APIResponseSchema } from '@/schemas/api.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/libs/api.lib';
import { Slot } from '@radix-ui/react-slot';

type DisableActionButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  actionId: Action['id'];
  asChild?: boolean;
  onClick?: React.MouseEventHandler<unknown>;
};

export function DisableActionButton({
  actionId,
  asChild,
  onClick,
  ...props
}: DisableActionButtonProps) {
  const Comp = asChild ? Slot : 'button';

  const disableActionMutation = useDisableActionMutation({
    actionId,
  });

  return (
    <Comp
      {...props}
      onClick={(e) => {
        disableActionMutation.mutate();
        onClick?.(e);
      }}
      disabled={disableActionMutation.isLoading}
      data-loading={disableActionMutation.isLoading}
    />
  );
}

const DisableActionResponseSchema = APIResponseSchema({
  schema: ActionSchema.pick({
    id: true,
    name: true,
  }),
});

type UseDisableActionMutationParams = {
  actionId: Action['id'];
};

function useDisableActionMutation({ actionId }: UseDisableActionMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn() {
      try {
        const res = await api.put(undefined, `/actions/${actionId}/disable`);

        return DisableActionResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries(['action', 'index']);
      await queryClient.invalidateQueries(['action', 'show', actionId]);
    },
  });
}
