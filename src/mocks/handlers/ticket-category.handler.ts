import { TicketCategoryIndexRequestSchema } from "@/queries/ticket.query";
import {
  CreateTicketCategorySchema,
  TicketCategorySchema,
  TicketCategory,
  UpdateTicketCategorySchema,
} from "@/schemas/ticket.schema";
import localforage from "localforage";
import { rest } from "msw";
import { nanoid } from "nanoid";
import {
  allowAuthenticatedOnly,
  handleResponseError,
  successResponse,
} from "../mock-utils";
import { NotFoundError } from "@/utils/error.util";

export const ticketCategoryHandlers = [
  rest.post("/api/ticket-categories", async (req) => {
    try {
      await allowAuthenticatedOnly({ sessionId: req.cookies.sessionId });

      const data = CreateTicketCategorySchema.parse(await req.json());

      const unparsedStoredTicketCategories =
        (await localforage.getItem("ticket_categories")) ?? [];
      const storedTicketCategories = TicketCategorySchema.array().parse(
        unparsedStoredTicketCategories
      );

      const newTicketCategory: TicketCategory = {
        id: nanoid(),
        name: data.name,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newTicketCategories = [
        ...storedTicketCategories,
        newTicketCategory,
      ];

      await localforage.setItem("ticket_categories", newTicketCategories);

      return successResponse({
        data: newTicketCategory,
        message: "Successfully created ticket category",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.get("/api/ticket-categories", async (req) => {
    try {
      const unparsedStoredTicketCategories =
        (await localforage.getItem("ticket_categories")) ?? [];
      const storedTicketCategories = TicketCategorySchema.array().parse(
        unparsedStoredTicketCategories
      );

      const unparsedFilters = Object.fromEntries(req.url.searchParams);
      const filters = TicketCategoryIndexRequestSchema.parse(unparsedFilters);

      const filteredTicketCategories = storedTicketCategories.filter(
        (ticketCategory) => {
          if (filters.search) {
            const search = filters.search.toLowerCase();

            const isMatched = ticketCategory.name
              .toLowerCase()
              .includes(search);

            if (!isMatched) {
              return false;
            }
          }

          if (filters.is_archived) {
            if (filters.is_archived === "1" && !ticketCategory.is_archived) {
              return false;
            } else if (
              filters.is_archived === "0" &&
              ticketCategory.is_archived
            ) {
              return false;
            }
          }

          return true;
        }
      );

      return successResponse({
        data: filteredTicketCategories,
        message: "Successfully retrieved ticket categories",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.get("/api/ticket-categories/:ticketCategoryId", async (req) => {
    try {
      await allowAuthenticatedOnly({ sessionId: req.cookies.sessionId });

      const unparsedStoredTicketCategories =
        (await localforage.getItem("ticket_categories")) ?? [];
      const storedTicketCategories = TicketCategorySchema.array().parse(
        unparsedStoredTicketCategories
      );

      const ticketCategoryId = req.params.ticketCategoryId;

      const ticketCategory = storedTicketCategories.find(
        (ticketCategory) => ticketCategory.id === ticketCategoryId
      );

      if (!ticketCategory) {
        throw new NotFoundError("Ticket category is not found");
      }

      return successResponse({
        data: ticketCategory,
        message: "Successfully retrieved ticket category",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/ticket-categories/:ticketCategoryId", async (req) => {
    try {
      await allowAuthenticatedOnly({ sessionId: req.cookies.sessionId });

      const data = UpdateTicketCategorySchema.parse(await req.json());

      const unparsedStoredTicketCategories =
        (await localforage.getItem("ticket_categories")) ?? [];
      const storedTicketCategories = TicketCategorySchema.array().parse(
        unparsedStoredTicketCategories
      );

      const ticketCategoryId = req.params.ticketCategoryId;

      const ticketCategoryToUpdate = storedTicketCategories.find(
        (ticketCategory) => ticketCategory.id === ticketCategoryId
      );

      if (!ticketCategoryToUpdate) {
        throw new NotFoundError("Ticket category is not found");
      }

      const updatedTicketCategory: TicketCategory = {
        ...ticketCategoryToUpdate,
        ...data,
        updated_at: new Date().toISOString(),
      };

      const newTicketCategories = storedTicketCategories.map((ticketCategory) =>
        ticketCategory.id === ticketCategoryId
          ? updatedTicketCategory
          : ticketCategory
      );

      await localforage.setItem("ticket_categories", newTicketCategories);

      return successResponse({
        data: updatedTicketCategory,
        message: "Successfully updated ticket category",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/ticket-categories/:ticketCategoryId/archive", async (req) => {
    try {
      await allowAuthenticatedOnly({ sessionId: req.cookies.sessionId });

      const unparsedStoredTicketCategories =
        (await localforage.getItem("ticket_categories")) ?? [];
      const storedTicketCategories = TicketCategorySchema.array().parse(
        unparsedStoredTicketCategories
      );

      const ticketCategoryId = req.params.ticketCategoryId;

      const ticketCategoryToUpdate = storedTicketCategories.find(
        (ticketCategory) => ticketCategory.id === ticketCategoryId
      );

      if (!ticketCategoryToUpdate) {
        throw new NotFoundError("Ticket category is not found");
      }

      const updatedTicketCategory: TicketCategory = {
        ...ticketCategoryToUpdate,
        is_archived: true,
        updated_at: new Date().toISOString(),
      };

      const newTicketCategories = storedTicketCategories.map((ticketCategory) =>
        ticketCategory.id === ticketCategoryId
          ? updatedTicketCategory
          : ticketCategory
      );

      await localforage.setItem("ticket_categories", newTicketCategories);

      return successResponse({
        data: updatedTicketCategory,
        message: "Successfully archived ticket category",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
  rest.put("/api/ticket-categories/:ticketCategoryId/restore", async (req) => {
    try {
      const unparsedStoredTicketCategories =
        (await localforage.getItem("ticket_categories")) ?? [];
      const storedTicketCategories = TicketCategorySchema.array().parse(
        unparsedStoredTicketCategories
      );

      const ticketCategoryId = req.params.ticketCategoryId;

      const ticketCategoryToUpdate = storedTicketCategories.find(
        (ticketCategory) => ticketCategory.id === ticketCategoryId
      );

      if (!ticketCategoryToUpdate) {
        throw new NotFoundError("Ticket category is not found");
      }

      const updatedTicketCategory: TicketCategory = {
        ...ticketCategoryToUpdate,
        is_archived: false,
        updated_at: new Date().toISOString(),
      };

      const newTicketCategories = storedTicketCategories.map((ticketCategory) =>
        ticketCategory.id === ticketCategoryId
          ? updatedTicketCategory
          : ticketCategory
      );

      await localforage.setItem("ticket_categories", newTicketCategories);

      return successResponse({
        data: updatedTicketCategory,
        message: "Successfully restored ticket category",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
