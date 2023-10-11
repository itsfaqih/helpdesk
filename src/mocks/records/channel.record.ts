import { Channel, ChannelSchema } from "@/schemas/channel.schema";
import { NotFoundError } from "@/utils/error.util";
import localforage from "localforage";
import { nanoid } from "nanoid";

export const mockChannelRecords: Channel[] = [
  {
    id: nanoid(),
    name: "WhatsApp",
    description: "WhatsApp messaging app",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Telegram",
    description: "Telegram messaging app",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Facebook",
    description: "Facebook messenger",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Instagram",
    description: "Instagram DM",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Twitter",
    description: "Twitter DM",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Email",
    description: null,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "SMS",
    description: null,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Main Website",
    description: "Main website contact form",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Second Website",
    description: "Second website contact form",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Third Website",
    description: "Third website contact form",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Another",
    description: "Another contact form",
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
