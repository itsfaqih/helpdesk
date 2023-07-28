import { ClientIndexRequestSchema } from "@/queries/client.query";
import {
  CreateClientSchema,
  ClientSchema,
  Client,
  UpdateClientSchema,
} from "@/schemas/client.schema";
import { generatePaginationMeta } from "@/utils/api.util";
import localforage from "localforage";
import { rest } from "msw";
import { nanoid } from "nanoid";
import {
  allowAuthenticatedOnly,
  allowSuperAdminOnly,
  handleResponseError,
  successResponse,
} from "../mock-utils";
import { ConflictError, NotFoundError } from "@/utils/error.util";

export const clientHandlers = [
  rest.post("/api/clients", async (req) => {
    try {
      await allowSuperAdminOnly({ sessionId: req.cookies.sessionId });

      const data = CreateClientSchema.parse(await req.json());

      const unparsedStoredAdmins = (await localforage.getItem("clients")) ?? [];
      const storedAdmins = ClientSchema.array().parse(unparsedStoredAdmins);

      const isClientExisted = storedAdmins.some(
        (client) => client.full_name === data.full_name
      );

      if (isClientExisted) {
        throw new ConflictError(
          "Client with the same name is already registered"
        );
      }

      const newClient: Client = {
        id: nanoid(),
        full_name: data.full_name,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newClients = [...storedAdmins, newClient];

      await localforage.setItem("clients", newClients);

      return successResponse({
        data: newClient,
        message: "Successfully created client",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/clients/:clientId", async (req) => {
    try {
      await allowSuperAdminOnly({ sessionId: req.cookies.sessionId });

      const data = UpdateClientSchema.parse(await req.json());

      const unparsedStoredClients =
        (await localforage.getItem("clients")) ?? [];
      const storedClients = ClientSchema.array().parse(unparsedStoredClients);

      const clientId = req.params.clientId;

      const clientToUpdate = storedClients.find(
        (client) => client.id === clientId
      );

      if (!clientToUpdate) {
        throw new NotFoundError("Client is not found");
      }

      const updatedClient: Client = {
        ...clientToUpdate,
        full_name: data.full_name,
        updated_at: new Date().toISOString(),
      };

      const newClients = storedClients.map((client) =>
        client.id === clientId ? updatedClient : client
      );

      await localforage.setItem("clients", newClients);

      return successResponse({
        data: updatedClient,
        message: "Successfully updated client",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.get("/api/clients", async (req) => {
    try {
      await allowAuthenticatedOnly({ sessionId: req.cookies.sessionId });

      const unparsedStoredClients =
        (await localforage.getItem("clients")) ?? [];
      const storedClients = ClientSchema.array().parse(unparsedStoredClients);

      const unparsedFilters = Object.fromEntries(req.url.searchParams);
      const filters = ClientIndexRequestSchema.parse(unparsedFilters);

      const filteredClients = storedClients.filter((client) => {
        if (filters.search) {
          const search = filters.search.toLowerCase();

          const isMatched = client.full_name.toLowerCase().includes(search);

          if (!isMatched) {
            return false;
          }
        }

        if (filters.is_archived) {
          if (filters.is_archived === "1" && !client.is_archived) {
            return false;
          } else if (filters.is_archived === "0" && client.is_archived) {
            return false;
          }
        } else {
          return client.is_archived === false;
        }

        return true;
      });

      const page = filters.page ?? 1;

      const paginatedClients = filteredClients.slice(
        (page - 1) * 10,
        page * 10
      );

      return successResponse({
        data: paginatedClients,
        message: "Successfully retrieved clients",
        meta: {
          ...generatePaginationMeta({
            currentPage: page,
            total: filteredClients.length,
          }),
        },
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.get("/api/clients/:clientId", async (req) => {
    try {
      await allowAuthenticatedOnly({ sessionId: req.cookies.sessionId });

      const unparsedStoredClients =
        (await localforage.getItem("clients")) ?? [];
      const storedClients = ClientSchema.array().parse(unparsedStoredClients);

      const clientId = req.params.clientId;

      const client = storedClients.find((client) => client.id === clientId);

      if (!client) {
        throw new NotFoundError("Client is not found");
      }

      return successResponse({
        data: client,
        message: "Successfully retrieved client",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/clients/:clientId/archive", async (req) => {
    try {
      await allowSuperAdminOnly({ sessionId: req.cookies.sessionId });

      const unparsedStoredClient = (await localforage.getItem("clients")) ?? [];
      const storedClients = ClientSchema.array().parse(unparsedStoredClient);

      const clientId = req.params.clientId;

      const clientToUpdate = storedClients.find(
        (client) => client.id === clientId
      );

      if (!clientToUpdate) {
        throw new NotFoundError("Client is not found");
      }

      const updatedClient: Client = {
        ...clientToUpdate,
        is_archived: true,
        updated_at: new Date().toISOString(),
      };

      const newClients = storedClients.map((client) =>
        client.id === clientId ? updatedClient : client
      );

      await localforage.setItem("clients", newClients);

      return successResponse({
        data: updatedClient,
        message: "Successfully archived client",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/clients/:clientId/restore", async (req) => {
    try {
      await allowSuperAdminOnly({ sessionId: req.cookies.sessionId });

      const unparsedStoredClients =
        (await localforage.getItem("clients")) ?? [];
      const storedClients = ClientSchema.array().parse(unparsedStoredClients);

      const clientId = req.params.clientId;

      const clientToUpdate = storedClients.find(
        (client) => client.id === clientId
      );

      if (!clientToUpdate) {
        throw new NotFoundError("Client is not found");
      }

      const updatedClient: Client = {
        ...clientToUpdate,
        is_archived: false,
        updated_at: new Date().toISOString(),
      };

      const newClients = storedClients.map((client) =>
        client.id === clientId ? updatedClient : client
      );

      await localforage.setItem("clients", newClients);

      return successResponse({
        data: updatedClient,
        message: "Successfully activated client",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];