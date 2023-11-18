import { Client } from '@/schemas/client.schema';
import { nanoid } from 'nanoid';
import { db } from './db';

export const mockClientRecords: Client[] = [
  {
    id: nanoid(),
    full_name: 'Client 1',
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    full_name: 'Client 2',
    is_archived: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getClients() {
  return await db.clients.toArray();
}

export async function getClientById(clientId: Client['id']) {
  const client = await db.clients.get(clientId);

  return client;
}
