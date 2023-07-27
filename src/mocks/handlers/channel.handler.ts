import { ChannelIndexRequestSchema } from "@/queries/channel.query";
import {
  CreateChannelSchema,
  ChannelSchema,
  Channel,
} from "@/schemas/channel.schema";
import { generatePaginationMeta } from "@/utils/api.util";
import localforage from "localforage";
import { rest } from "msw";
import { nanoid } from "nanoid";
import {
  allowAuthenticatedOnly,
  allowSuperAdminOnly,
  handleResponseError,
  successResponse,
} from "../utils";
import { ConflictError, NotFoundError } from "@/utils/error.util";

export const channelHandlers = [
  rest.post("/api/channels", async (req) => {
    try {
      await allowSuperAdminOnly();

      const data = CreateChannelSchema.parse(await req.json());

      const unparsedStoredAdmins =
        (await localforage.getItem("channels")) ?? [];
      const storedAdmins = ChannelSchema.array().parse(unparsedStoredAdmins);

      const isChannelExisted = storedAdmins.some(
        (channel) => channel.name === data.name
      );

      if (isChannelExisted) {
        throw new ConflictError(
          "Channel with the same name is already registered"
        );
      }

      const newChannel: Channel = {
        id: nanoid(),
        name: data.name,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newChannels = [...storedAdmins, newChannel];

      await localforage.setItem("channels", newChannels);

      return successResponse({
        data: newChannel,
        message: "Successfully created channel",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.get("/api/channels", async (req) => {
    try {
      await allowAuthenticatedOnly();

      const unparsedStoredChannels =
        (await localforage.getItem("channels")) ?? [];
      const storedChannels = ChannelSchema.array().parse(
        unparsedStoredChannels
      );

      const unparsedFilters = Object.fromEntries(req.url.searchParams);
      const filters = ChannelIndexRequestSchema.parse(unparsedFilters);

      const filteredChannels = storedChannels.filter((channel) => {
        if (filters.search) {
          const search = filters.search.toLowerCase();

          const isMatched = channel.name.toLowerCase().includes(search);

          if (!isMatched) {
            return false;
          }
        }

        if (filters.is_archived) {
          if (filters.is_archived === "1" && !channel.is_archived) {
            return false;
          } else if (filters.is_archived === "0" && channel.is_archived) {
            return false;
          }
        } else {
          return channel.is_archived === false;
        }

        return true;
      });

      const page = filters.page ?? 1;

      const paginatedChannels = filteredChannels.slice(
        (page - 1) * 10,
        page * 10
      );

      return successResponse({
        data: paginatedChannels,
        message: "Successfully retrieved channels",
        meta: {
          ...generatePaginationMeta({
            currentPage: page,
            total: filteredChannels.length,
          }),
        },
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.get("/api/channels/:channelId", async (req) => {
    try {
      await allowAuthenticatedOnly();

      const unparsedStoredChannels =
        (await localforage.getItem("channels")) ?? [];
      const storedChannels = ChannelSchema.array().parse(
        unparsedStoredChannels
      );

      const channelId = req.params.channelId;

      const channel = storedChannels.find(
        (channel) => channel.id === channelId
      );

      if (!channel) {
        throw new NotFoundError("Channel is not found");
      }

      return successResponse({
        data: channel,
        message: "Successfully retrieved channel",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/channels/:channelId/archive", async (req) => {
    try {
      await allowSuperAdminOnly();

      const unparsedStoredChannel =
        (await localforage.getItem("channels")) ?? [];
      const storedChannels = ChannelSchema.array().parse(
        unparsedStoredChannel
      );

      const channelId = req.params.channelId;

      const channelToUpdate = storedChannels.find(
        (channel) => channel.id === channelId
      );

      if (!channelToUpdate) {
        throw new NotFoundError("Channel is not found");
      }

      const updatedChannel: Channel = {
        ...channelToUpdate,
        is_archived: true,
        updated_at: new Date().toISOString(),
      };

      const newChannels = storedChannels.map((channel) =>
        channel.id === channelId ? updatedChannel : channel
      );

      await localforage.setItem("channels", newChannels);

      return successResponse({
        data: updatedChannel,
        message: "Successfully archived channel",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/channels/:channelId/restore", async (req) => {
    try {
      await allowSuperAdminOnly();

      const unparsedStoredChannels =
        (await localforage.getItem("channels")) ?? [];
      const storedChannels = ChannelSchema.array().parse(
        unparsedStoredChannels
      );

      const channelId = req.params.channelId;

      const channelToUpdate = storedChannels.find(
        (channel) => channel.id === channelId
      );

      if (!channelToUpdate) {
        throw new NotFoundError("Channel is not found");
      }

      const updatedChannel: Channel = {
        ...channelToUpdate,
        is_archived: false,
        updated_at: new Date().toISOString(),
      };

      const newChannels = storedChannels.map((channel) =>
        channel.id === channelId ? updatedChannel : channel
      );

      await localforage.setItem("channels", newChannels);

      return successResponse({
        data: updatedChannel,
        message: "Successfully activated channel",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
