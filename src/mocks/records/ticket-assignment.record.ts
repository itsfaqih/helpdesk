import { Ticket, TicketAssignmentWithRelations } from '@/schemas/ticket.schema';
import { nanoid } from 'nanoid';
import { mockTicketRecords } from './ticket.record';
import { mockUserRecords } from './user.record';
import { db } from './db';

export function mockTicketAssignments() {
  return [
    {
      id: nanoid(),
      ticket_id: mockTicketRecords[0].id,
      user_id: mockUserRecords[0].id,
      created_at: new Date().toISOString(),
    },
    {
      id: nanoid(),
      ticket_id: mockTicketRecords[1].id,
      user_id: mockUserRecords[1].id,
      created_at: new Date().toISOString(),
    },
  ];
}

type GetTicketAssignmentsWithRelationsByTicketIdOptions = {
  ticketId: Ticket['id'];
};

export async function getTicketAssignmentsWithRelationsByTicketId(
  options: GetTicketAssignmentsWithRelationsByTicketIdOptions,
): Promise<TicketAssignmentWithRelations[]> {
  const ticketAssignments = await db.ticket_assignments
    .where({ ticket_id: options.ticketId })
    .toArray();

  const ticketAssignmentsWithRelations: TicketAssignmentWithRelations[] = await Promise.all(
    ticketAssignments.map(async (ticketAssignment) => {
      const user = await db.users.where('id').equals(ticketAssignment.user_id).first();

      if (!user) {
        throw new Error(`User with id ${ticketAssignment.user_id} not found`);
      }

      const ticket = await db.tickets.where('id').equals(ticketAssignment.ticket_id).first();

      if (!ticket) {
        throw new Error(`Ticket with id ${ticketAssignment.ticket_id} not found`);
      }

      const ticketAssignmentWithRelations: TicketAssignmentWithRelations = {
        ...ticketAssignment,
        user,
        ticket,
      };

      return ticketAssignmentWithRelations;
    }),
  );

  return ticketAssignmentsWithRelations;
}
