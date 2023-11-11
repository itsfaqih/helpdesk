import { adminHandlers } from './handlers/admin.handler';
import { authHandlers } from './handlers/auth.handler';
import { clientHandlers } from './handlers/client.handler';
import { channelHandlers } from './handlers/channel.handler';
import { ticketCategoryHandlers } from './handlers/ticket-category.handler';
import { ticketHandlers } from './handlers/ticket.handler';
import { actionHandlers } from './handlers/action.handler';
import { actionFieldHandlers } from './handlers/action-field.handler';
import { RequestHandler } from 'msw';

export const handlers: RequestHandler[] = [
  ...adminHandlers,
  ...authHandlers,
  ...clientHandlers,
  ...channelHandlers,
  ...actionHandlers,
  ...actionFieldHandlers,
  ...ticketHandlers,
  ...ticketCategoryHandlers,
];
