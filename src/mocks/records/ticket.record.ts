import { Ticket, TicketWithRelations } from '@/schemas/ticket.schema';
import { nanoid } from 'nanoid';
import { getClientById, mockClientRecords } from './client.record';
import { getChannelById, mockChannelRecords } from './channel.record';
import { getTicketAssignmentsWithRelationsByTicketId } from './ticket-assignment.record';
import { db } from './db';
import { NotFoundError } from '@/utils/error.util';

export const mockTicketRecords: Ticket[] = [
  {
    id: nanoid(),
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
    channel_id: mockChannelRecords[3].id,
    client_id: mockClientRecords[1].id,
    title: 'Makanannya basi',
    status: 'open',
    is_archived: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

type GetTicketWithRelationsByIdOptions = {
  ticketId: Ticket['id'];
};

export async function getTicketWithRelationsById(
  options: GetTicketWithRelationsByIdOptions,
): Promise<TicketWithRelations | null> {
  const ticket = await db.tickets.where('id').equals(options.ticketId).first();

  if (!ticket) {
    return null;
  }

  const channel = await getChannelById(ticket.channel_id);

  if (!channel) {
    throw new NotFoundError(
      `Ticket ${options.ticketId}: channel with id ${ticket.channel_id} is not found`,
    );
  }

  const client = await getClientById(ticket.client_id);

  if (!client) {
    throw new NotFoundError(`Client with id ${ticket.client_id} is not found`);
  }

  const tagIds = (await db.ticket_taggings.where({ ticket_id: ticket.id }).toArray()).map(
    (ticketTagging) => ticketTagging.ticket_tag_id,
  );

  const ticketWithRelations: TicketWithRelations = {
    ...ticket,
    assignments: await getTicketAssignmentsWithRelationsByTicketId({
      ticketId: ticket.id,
    }),
    tags: (await db.ticket_tags.bulkGet(tagIds)).filter(Boolean),
    channel,
    client,
  };

  return ticketWithRelations;
}

export async function getTicketsWithRelations(): Promise<TicketWithRelations[]> {
  const storedTickets = await db.tickets.toArray();

  const storedTicketsWithRelations: TicketWithRelations[] = await Promise.all(
    storedTickets.map(async (ticket) => {
      const channel = await getChannelById(ticket.channel_id);

      if (!channel) {
        throw new NotFoundError(
          `Ticket ${ticket.id}: channel with id ${ticket.channel_id} is not found`,
        );
      }

      const client = await getClientById(ticket.client_id);

      if (!client) {
        throw new NotFoundError(`Client with id ${ticket.client_id} is not found`);
      }

      const tagIds = (await db.ticket_taggings.where('ticket_id').equals(ticket.id).toArray()).map(
        (ticketTagging) => ticketTagging.ticket_tag_id,
      );

      const ticketWithRelations: TicketWithRelations = {
        ...ticket,
        assignments: await getTicketAssignmentsWithRelationsByTicketId({
          ticketId: ticket.id,
        }),
        tags: (await db.ticket_tags.bulkGet(tagIds)).filter(Boolean),
        channel,
        client,
      };

      return ticketWithRelations;
    }),
  );

  return storedTicketsWithRelations;
}
