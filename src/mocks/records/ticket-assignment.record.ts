import {
  Ticket,
  TicketAssignmentSchema,
  TicketAssignmentWithRelations,
} from '@/schemas/ticket.schema';
import { nanoid } from 'nanoid';
import { getTicketById, mockTicketRecords } from './ticket.record';
import { getAdminById, mockAdminRecords } from './admin.record';
import localforage from 'localforage';

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
  withTrash?: boolean;
};

export async function getTicketAssignmentsWithRelationsByTicketId(
  options: GetTicketAssignmentsWithRelationsByTicketIdOptions,
): Promise<TicketAssignmentWithRelations[]> {
  const unparsedStoredTicketAssignments = await localforage.getItem('ticket_assignments');
  const storedTicketAssignments = TicketAssignmentSchema.array().parse(
    unparsedStoredTicketAssignments,
  );

  const filteredTicketAssignments = storedTicketAssignments.filter((ticketAssignment) => {
    if (ticketAssignment.ticket_id !== options.ticketId) {
      return false;
    }

    if (options.withTrash) {
      return true;
    } else {
      return !ticketAssignment.deleted_at;
    }
  });

  const ticketAssignmentsWithRelations: TicketAssignmentWithRelations[] = await Promise.all(
    filteredTicketAssignments.map(async (ticketAssignment) => {
      const ticketAssignmentWithRelations: TicketAssignmentWithRelations = {
        ...ticketAssignment,
        admin: await getAdminById(ticketAssignment.admin_id),
        ticket: await getTicketById(ticketAssignment.ticket_id),
      };

      return ticketAssignmentWithRelations;
    }),
  );

  return ticketAssignmentsWithRelations;
}
