import { Ticket, TicketSchema, TicketWithRelations } from '@/schemas/ticket.schema';
import { nanoid } from 'nanoid';
import { getClientById, mockClientRecords } from './client.record';
import { getTicketCategoryById, mockTicketCategoryRecords } from './ticket-category.record';
import { getChannelByid, mockChannelRecords } from './channel.record';
import localforage from 'localforage';
import { getTicketAssignmentsWithRelationsByTicketId } from './ticket-assignment.record';
import { NotFoundError } from '@/utils/error.util';

export const mockTicketRecords: Ticket[] = [
  {
    id: nanoid(),
    category_id: mockTicketCategoryRecords[0].id,
    channel_id: mockChannelRecords[0].id,
    client_id: mockClientRecords[0].id,
    title: 'Staf kurang ramah',
    description: `Gue mau lapor nih tentang pengalaman gue di Restoran XYZ. Jadi ceritanya, gue tuh nyoba mampir ke restoran itu pada tanggal XX/XX/XXXX, dan wah, bener-bener kecewa deh sama pelayanannya. Stafnya tuh kurang ramah banget, pelayanannya juga lama banget, dan gak jarang pesenan gue dikasih yang salah, gitu loh!\nJadi, beneran deh, gue harap banget masalah ini bisa diatasi dengan serius dan diperbaiki secepatnya. Gue pengen kasih masukan yang membangun biar pengalaman nyokap-nyokap Jakarta Selatan yang lain juga bisa lebih kece di restoran ini.`,
    status: 'open',
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    category_id: mockTicketCategoryRecords[2].id,
    channel_id: mockChannelRecords[1].id,
    client_id: mockClientRecords[0].id,
    title: 'Saran Menu Makanan: Sate Ayam',
    status: 'open',
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    category_id: mockTicketCategoryRecords[0].id,
    channel_id: mockChannelRecords[2].id,
    client_id: mockClientRecords[1].id,
    title: 'Staf kurang ramah, pelayanan lelet',
    description: `Jadi, ceritanya pas aku kesana tanggal XX/XX/XXXX, aku bener-bener kecewa sama pelayanannya. Stafnya kurang ramah banget, pelayanannya juga lama banget, dan kadang pesenan aku dikasih yang salah, gitu loh!`,
    status: 'open',
    is_archived: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    category_id: mockTicketCategoryRecords[1].id,
    channel_id: mockChannelRecords[3].id,
    client_id: mockClientRecords[1].id,
    title: 'Makanannya basi',
    status: 'open',
    is_archived: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getTickets(): Promise<Ticket[]> {
  const unparsedStoredTickets = await localforage.getItem('tickets');
  const storedTickets = TicketSchema.array().parse(unparsedStoredTickets);

  return storedTickets;
}

export async function getTicketById(ticketId: Ticket['id']): Promise<Ticket> {
  const storedTickets = await getTickets();

  const ticket = storedTickets.find((ticket) => ticket.id === ticketId);

  if (!ticket) {
    throw new NotFoundError(`Ticket with id ${ticketId} not found`);
  }

  return ticket;
}

type GetTicketWithRelationsByIdOptions = {
  ticketId: Ticket['id'];
  assignments?: {
    withTrash?: boolean;
  };
};

export async function getTicketWithRelationsById(
  options: GetTicketWithRelationsByIdOptions,
): Promise<TicketWithRelations> {
  const ticket = await getTicketById(options.ticketId);

  const ticketWithRelations: TicketWithRelations = {
    ...ticket,
    assignments: await getTicketAssignmentsWithRelationsByTicketId({
      ticketId: ticket.id,
      withTrash: options.assignments?.withTrash,
    }),
    category: await getTicketCategoryById(ticket.category_id),
    channel: await getChannelByid(ticket.channel_id),
    client: await getClientById(ticket.client_id),
  };

  return ticketWithRelations;
}

type GetTicketsWithRelationsOptions = {
  assignments?: {
    withTrash?: boolean;
  };
};

export async function getTicketsWithRelations(
  options?: GetTicketsWithRelationsOptions,
): Promise<TicketWithRelations[]> {
  const storedTickets = await getTickets();

  const storedTicketsWithRelations: TicketWithRelations[] = await Promise.all(
    storedTickets.map(async (ticket) => {
      const ticketWithRelations: TicketWithRelations = {
        ...ticket,
        assignments: await getTicketAssignmentsWithRelationsByTicketId({
          ticketId: ticket.id,
          withTrash: options?.assignments?.withTrash,
        }),
        category: await getTicketCategoryById(ticket.category_id),
        channel: await getChannelByid(ticket.channel_id),
        client: await getClientById(ticket.client_id),
      };

      return ticketWithRelations;
    }),
  );

  return storedTicketsWithRelations;
}
