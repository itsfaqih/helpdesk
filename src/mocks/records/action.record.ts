import { ActionResponse, ActionSchema } from "@/schemas/action.schema";
import { nanoid } from "nanoid";
import { mockChannelRecords } from "./channel.record";
import { Channel } from "@/schemas/channel.schema";
import localforage from "localforage";
import { NotFoundError } from "@/utils/error.util";

export const mockActionRecords: ActionResponse[] = [
  {
    id: nanoid(),
    cta_label: "Reply by Email",
    cta_icon_url: null,
    channel_id: mockChannelRecords[5].id,
  },
];

export async function getActionByChannelId(channelId: Channel["id"]) {
  const unparsedStoredActions = await localforage.getItem(
    "channel_ticket_responses"
  );
  const storedActions = ActionSchema.array().parse(unparsedStoredActions);

  const action = storedActions.find(
    (action) => action.channel_id === channelId
  );

  if (!action) {
    throw new NotFoundError(`Action with channel id ${channelId} not found`);
  }

  return action;
}
