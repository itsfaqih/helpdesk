import { rest } from "msw";
import { matchSorter } from "match-sorter";
import {
  allowAuthenticatedOnly,
  handleResponseError,
  successResponse,
} from "../mock-utils";
import { generatePaginationMeta } from "@/utils/api.util";
import localforage from "localforage";
import { ActionSchema } from "@/schemas/action.schema";
import { ActionIndexRequestSchema } from "@/queries/action.query";

export const actionHandlers = [
  rest.get("/api/actions", async (req) => {
    try {
      await allowAuthenticatedOnly({ sessionId: req.cookies.sessionId });

      const unparsedStoredActions =
        (await localforage.getItem("actions")) ?? [];
      const storedActions = ActionSchema.array().parse(unparsedStoredActions);

      const unparsedFilters = Object.fromEntries(req.url.searchParams);
      const filters = ActionIndexRequestSchema.parse(unparsedFilters);

      const filteredActions = matchSorter(storedActions, filters.search ?? "", {
        keys: ["cta_label"],
      });

      const page = filters.page ?? 1;

      const paginatedActions = filteredActions.slice(
        (page - 1) * 10,
        page * 10
      );

      return successResponse({
        data: paginatedActions,
        message: "Successfully retrieved actions",
        meta: {
          ...generatePaginationMeta({
            currentPage: page,
            total: filteredActions.length,
          }),
        },
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
