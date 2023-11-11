import { api } from '@/libs/api.lib';
import { APIResponseSchema } from '@/schemas/api.schema';
import {
  CreateTicketAssignmentSchema,
  DeleteTicketAssignmentSchema,
  TicketAssignmentSchema,
} from '@/schemas/ticket.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const CreateTicketAssignmentResponseSchema = APIResponseSchema({
  schema: TicketAssignmentSchema,
});

export function useCreateTicketAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: CreateTicketAssignmentSchema) {
      try {
        const res = await api.post(data, `/tickets/${data.ticket_id}/assignments`);

        return CreateTicketAssignmentResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess(res) {
      await queryClient.invalidateQueries({ queryKey: ['ticket', 'index'] });
      await queryClient.invalidateQueries({ queryKey: ['ticket', 'show', res.data.ticket_id] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'index'] });
    },
  });
}

const DeleteTicketAssignmentResponseSchema = APIResponseSchema({
  schema: TicketAssignmentSchema,
});

export function useDeleteTicketAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({ id, ticket_id }: DeleteTicketAssignmentSchema) {
      try {
        const res = await api.delete(`/tickets/${ticket_id}/assignments/${id}`);

        return DeleteTicketAssignmentResponseSchema.parse(res);
      } catch (error) {
        throw new Error('Something went wrong. Please contact the administrator');
      }
    },
    async onSuccess(res) {
      await queryClient.invalidateQueries({ queryKey: ['ticket', 'index'] });
      await queryClient.invalidateQueries({ queryKey: ['ticket', 'show', res.data.ticket_id] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'index'] });
    },
  });
}
