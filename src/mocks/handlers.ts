import { adminHandlers } from "./handlers/admin.handler";
import { authHandlers } from "./handlers/auth.handler";
import { clientHandlers } from "./handlers/client.handler";
import { ticketCategoryHandlers } from "./handlers/ticket-category.handler";
import { ticketHandlers } from "./handlers/ticket.handler";

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
  ...clientHandlers,
  ...ticketHandlers,
  ...ticketCategoryHandlers,
];
