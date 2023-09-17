import { rest } from "msw";
import {
  allowAuthenticatedOnly,
  handleResponseError,
  successResponse,
} from "../mock-utils";
import { getActionFieldsByActionId } from "../records/action-field.record";

export const actionFieldHandlers = [
  rest.get("/api/actions/:actionId/fields", async (req) => {
    try {
      await allowAuthenticatedOnly({ sessionId: req.cookies.sessionId });

      const actionId = req.params.actionId as string;

      const storedActionFields = await getActionFieldsByActionId(actionId);

      return successResponse({
        data: storedActionFields,
        message: "Successfully retrieved action fields",
      });
    } catch (error) {
      return handleResponseError(error);
    }
  }),
];
