import { TicketTag } from '@/schemas/ticket.schema';
import { nanoid } from 'nanoid';

export const mockTicketTagRecords: TicketTag[] = [
  {
    id: nanoid(),
    name: 'Masalah Pelayanan',
    description: null,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: 'Masalah Menu',
    description: null,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: 'Saran Menu',
    description: null,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: 'Lainnya',
    description: null,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
