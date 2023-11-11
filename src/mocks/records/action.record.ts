import { Action, ActionSchema } from '@/schemas/action.schema';
import { nanoid } from 'nanoid';
import { Channel } from '@/schemas/channel.schema';
import localforage from 'localforage';
import { ActionChannelSchema } from '@/schemas/action-channel.schema';

export const mockActionRecords: Action[] = [
  {
    id: nanoid(),
    label: 'Reply by Email',
    icon_type: 'emoji',
    icon_value: 'email',
    description: "Send the reply directly to the customer's email",
    form_method: 'POST',
    webhook_url: 'https://example.com/send-email',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    is_archived: false,
    is_disabled: false,
  },
];

export async function getActionsByChannelId(channelId: Channel['id']): Promise<Action[]> {
  const unparsedStoredActionChannels = await localforage.getItem('action_channel');

  const storedActionChannels = ActionChannelSchema.array().parse(unparsedStoredActionChannels);

  const actionChannels = storedActionChannels.filter(
    (actionChannel) => actionChannel.channel_id === channelId,
  );

  const unparsedStoredActions = await localforage.getItem('actions');

  const storedActions = ActionSchema.array().parse(unparsedStoredActions);

  const actions = storedActions.filter((action) =>
    actionChannels.some((actionChannel) => actionChannel.action_id === action.id),
  );

  return actions;
}
