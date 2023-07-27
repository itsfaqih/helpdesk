import { TicketIndexRequestSchema } from "@/queries/ticket.query";
import {
  CreateTicketSchema,
  Ticket,
  TicketSchema,
  TicketWithRelationsSchema,
} from "@/schemas/ticket.schema";
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
import { NotFoundError } from "@/utils/error.util";

export const ticketHandlers = [
  rest.post("/api/tickets", async (req) => {
    try {
      await allowAuthenticatedOnly();

      const data = CreateTicketSchema.parse(await req.json());

      const unparsedStoredAdmins = (await localforage.getItem("tickets")) ?? [];
      const storedAdmins = TicketSchema.array().parse(unparsedStoredAdmins);

      const newTicket: Ticket = {
        id: nanoid(),
        title: data.title,
        channel: "System",
        status: "open",
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client_id: data.client_id,
        category_id: data.category_id,
      };

      const newTickets = [...storedAdmins, newTicket];

      await localforage.setItem("tickets", newTickets);

      return successResponse({
        data: newTicket,
        message: "Successfully created ticket",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.get("/api/tickets", async (req) => {
    try {
      await allowAuthenticatedOnly();

      const unparsedStoredTickets =
        (await localforage.getItem("tickets")) ?? [];
      const storedTickets = TicketWithRelationsSchema.array().parse(
        unparsedStoredTickets
      );

      const unparsedFilters = Object.fromEntries(req.url.searchParams);
      const filters = TicketIndexRequestSchema.parse(unparsedFilters);

      const filteredTickets = storedTickets.filter((ticket) => {
        if (filters.search) {
          const search = filters.search.toLowerCase();

          const isMatched = ticket.title.toLowerCase().includes(search);

          if (!isMatched) {
            return false;
          }
        }

        if (filters.status) {
          if (ticket.status !== filters.status) {
            return false;
          }
        }

        if (filters.category_id) {
          if (ticket.category_id !== filters.category_id) {
            return false;
          }
        }

        if (filters.is_archived) {
          if (filters.is_archived === "1" && !ticket.is_archived) {
            return false;
          } else if (filters.is_archived === "0" && ticket.is_archived) {
            return false;
          }
        } else {
          return ticket.is_archived === false;
        }

        return true;
      });

      const page = filters.page ?? 1;

      const paginatedTickets = filteredTickets.slice(
        (page - 1) * 10,
        page * 10
      );

      return successResponse({
        data: paginatedTickets,
        message: "Successfully retrieved tickets",
        meta: {
          ...generatePaginationMeta({
            currentPage: page,
            total: filteredTickets.length,
          }),
        },
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.get("/api/tickets/:ticketId", async (req) => {
    try {
      await allowAuthenticatedOnly();

      const unparsedStoredTickets =
        (await localforage.getItem("tickets")) ?? [];
      const storedTickets = TicketWithRelationsSchema.array().parse(
        unparsedStoredTickets
      );

      const ticketId = req.params.ticketId;

      const ticket = storedTickets.find((ticket) => ticket.id === ticketId);

      if (!ticket) {
        throw new NotFoundError("Ticket is not found");
      }

      return successResponse({
        data: ticket,
        message: "Successfully retrieved ticket",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/tickets/:ticketId/archive", async (req) => {
    try {
      await allowAuthenticatedOnly();

      const unparsedStoredTickets =
        (await localforage.getItem("tickets")) ?? [];
      const storedTickets = TicketSchema.array().parse(unparsedStoredTickets);

      const ticketId = req.params.ticketId;

      const ticketToUpdate = storedTickets.find(
        (ticket) => ticket.id === ticketId
      );

      if (!ticketToUpdate) {
        throw new NotFoundError("Ticket is not found");
      }

      const updatedTicket: Ticket = {
        ...ticketToUpdate,
        is_archived: true,
        updated_at: new Date().toISOString(),
      };

      const newTickets = storedTickets.map((ticket) =>
        ticket.id === ticketId ? updatedTicket : ticket
      );

      await localforage.setItem("tickets", newTickets);

      return successResponse({
        data: updatedTicket,
        message: "Successfully archived ticket",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/tickets/:ticketId/restore", async (req) => {
    try {
      await allowSuperAdminOnly();

      const unparsedStoredTickets =
        (await localforage.getItem("tickets")) ?? [];
      const storedTickets = TicketSchema.array().parse(unparsedStoredTickets);

      const ticketId = req.params.ticketId;

      const ticketToUpdate = storedTickets.find(
        (ticket) => ticket.id === ticketId
      );

      if (!ticketToUpdate) {
        throw new NotFoundError("Ticket is not found");
      }

      const updatedTicket: Ticket = {
        ...ticketToUpdate,
        is_archived: false,
        updated_at: new Date().toISOString(),
      };

      const newTickets = storedTickets.map((ticket) =>
        ticket.id === ticketId ? updatedTicket : ticket
      );

      await localforage.setItem("tickets", newTickets);

      return successResponse({
        data: updatedTicket,
        message: "Successfully activated ticket",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
