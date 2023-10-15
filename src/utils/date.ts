import { format } from 'date-fns';

export function formatDateTime(datetime: string) {
  return format(new Date(datetime), 'dd/MM/yyyy HH:mm');
}
