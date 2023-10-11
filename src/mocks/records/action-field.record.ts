import {
  Action,
  ActionField,
  ActionFieldSchema,
  ActionSchema,
} from "@/schemas/action.schema";
import { nanoid } from "nanoid";
import localforage from "localforage";
import { NotFoundError } from "@/utils/error.util";
import { mockActionRecords } from "./action.record";

export function mockActionFieldRecords(): ActionField[] {
  return [
    // Email
    {
      id: nanoid(),
      action_id: mockActionRecords[0].id,
      name: "subject",
      label: "Subject",
      type: "text",
      placeholder: "Enter subject",
      helper_text: null,
      is_required: true,
    },
    {
      id: nanoid(),
      action_id: mockActionRecords[0].id,
      name: "content",
      label: "Content",
      type: "textarea",
      placeholder: "Enter content",
      helper_text: null,
      is_required: true,
    },
    {
      id: nanoid(),
      action_id: mockActionRecords[0].id,
      name: "attachment",
      label: "Attachment",
      type: "file",
      placeholder: null,
      helper_text: null,
      is_required: false,
    },
  ];
}

export async function getActionFieldsByActionId(
  actionId: Action["id"]
) {
  const unparsedStoredActions = await localforage.getItem("actions");

  const storedActions = ActionSchema.array().parse(unparsedStoredActions);

  const action = storedActions.find((action) => action.id === actionId);

  if (!action) {
    throw new NotFoundError(`Action with channel id ${actionId} not found`);
  }

  const unparsedStoredActionFields = await localforage.getItem("action_fields");
  const storedActionFields = ActionFieldSchema.array().parse(
    unparsedStoredActionFields
  );

  const actionFields = storedActionFields.filter(
    (actionField) => actionField.action_id === actionId
  );

  return actionFields;
}
