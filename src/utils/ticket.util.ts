import { BadgeProps } from '@/components/base/badge';
import { TicketStatus } from '@/schemas/ticket.schema';

export function ticketStatusToBadgeColor(status: TicketStatus): BadgeProps['color'] {
  switch (status) {
    case 'open':
      return 'emerald';
    case 'in_progress':
      return 'amber';
    case 'resolved':
      return 'purple';
    case 'unresolved':
      return 'red';
    default:
      throw new Error('Unknown ticket status');
  }
}

export function ticketStatusToLabel(status: TicketStatus | ''): string {
  switch (status) {
    case 'open':
      return 'Open';
    case 'in_progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'unresolved':
      return 'Unresolved';
    case '':
      return 'All status';
    default:
      throw new Error('Unknown ticket status');
  }
}
