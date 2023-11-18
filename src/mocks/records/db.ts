import Dexie, { Table } from 'dexie';
import { ActionField } from '@/schemas/action-field.schema';
import { Action } from '@/schemas/action.schema';
import { Admin } from '@/schemas/admin.schema';
import { Channel } from '@/schemas/channel.schema';
import { Client } from '@/schemas/client.schema';
import { Ticket, TicketAssignment, TicketTag, TicketTagging } from '@/schemas/ticket.schema';

export class MainDatabase extends Dexie {
  action_fields!: Table<ActionField>;
  actions!: Table<Action>;
  admins!: Table<Admin>;
  channels!: Table<Channel>;
  clients!: Table<Client>;
  ticket_assignments!: Table<TicketAssignment>;
  ticket_taggings!: Table<TicketTagging>;
  ticket_tags!: Table<TicketTag>;
  tickets!: Table<Ticket>;

  constructor() {
    super('main_database');
    this.version(1).stores({
      action_channel: 'id, action_id, channel_id',
      action_fields:
        'id, action_id, name, label, type, placeholder, helper_text, is_required, order',
      actions:
        'id, icon_type, icon_value, label, description, form_method, webhook_url, is_archived, is_disabled, created_at, updated_at',
      admins: 'id, full_name, email, password, role, is_active, created_at, updated_at',
      channels: 'id, name, description, is_archived, created_at, updated_at',
      clients: 'id, full_name, is_archived, created_at, updated_at',
      ticket_assignments: 'id, ticket_id, admin_id, created_at, deleted_at',
      ticket_taggings: 'id, ticket_id, ticket_tag_id, created_at, deleted_at',
      ticket_tags: 'id, name, description, is_archived, created_at, updated_at',
      tickets:
        'id, title, description, status, is_archived, tag_id, channel_id, client_id, created_at, updated_at',
    });
  }
}

export const db = new MainDatabase();
