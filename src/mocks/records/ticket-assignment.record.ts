import { Ticket, TicketAssignmentWithRelations } from '@/schemas/ticket.schema';
import { nanoid } from 'nanoid';
import { mockTicketRecords } from './ticket.record';
import { mockAdminRecords } from './admin.record';
import { db } from './db';

export function mockTicketAssignments() {
  return [
    {
      id: nanoid(),
      ticket_id: mockTicketRecords[0].id,
      admin_id: mockAdminRecords[0].id,
      created_at: new Date().toISOString(),
    },
    {
      id: nanoid(),
      ticket_id: mockTicketRecords[1].id,
      admin_id: mockAdminRecords[1].id,
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
      const admin = await db.admins.where('id').equals(ticketAssignment.admin_id).first();

      if (!admin) {
        throw new Error(`Admin with id ${ticketAssignment.admin_id} not found`);
      }

      const ticket = await db.tickets.where('id').equals(ticketAssignment.ticket_id).first();

      if (!ticket) {
        throw new Error(`Ticket with id ${ticketAssignment.ticket_id} not found`);
      }

      const ticketAssignmentWithRelations: TicketAssignmentWithRelations = {
        ...ticketAssignment,
        admin,
        ticket,
      };

      return ticketAssignmentWithRelations;
    }),
  );

  return ticketAssignmentsWithRelations;
}
