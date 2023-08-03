import { Channel, ChannelSchema } from "@/schemas/channel.schema";
import { NotFoundError } from "@/utils/error.util";
import localforage from "localforage";
import { nanoid } from "nanoid";

export const mockChannelRecords: Channel[] = [
  {
    id: nanoid(),
    name: "WhatsApp",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Telegram",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Facebook",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Instagram",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Twitter",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Email",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "SMS",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Main Website",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Second Website",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Third Website",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Another",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getChannelByid(
  channelId: Channel["id"]
): Promise<Channel> {
  const unparsedStoredClients = await localforage.getItem("channels");
  const storedClients = ChannelSchema.array().parse(unparsedStoredClients);

  const client = storedClients.find((client) => client.id === channelId);

  if (!client) {
    throw new NotFoundError(`Channel with id ${channelId} is not found`);
  }

  return client;
}
