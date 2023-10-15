import { Client, ClientSchema } from '@/schemas/client.schema';
import { NotFoundError } from '@/utils/error.util';
import localforage from 'localforage';
import { nanoid } from 'nanoid';

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

export async function getClients(): Promise<Client[]> {
  const unparsedStoredClients = await localforage.getItem('clients');
  const storedClients = ClientSchema.array().parse(unparsedStoredClients);

  return storedClients;
}

export async function getClientById(clientId: Client['id']): Promise<Client> {
  const unparsedStoredClients = await localforage.getItem('clients');
  const storedClients = ClientSchema.array().parse(unparsedStoredClients);

  const client = storedClients.find((client) => client.id === clientId);

  if (!client) {
    throw new NotFoundError(`Client with id ${clientId} is not found`);
  }

  return client;
}
