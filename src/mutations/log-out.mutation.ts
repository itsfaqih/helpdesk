import { api } from '@/libs/api.lib';
import { useMutation } from '@tanstack/react-query';

export function useLogOutMutation() {
  return useMutation({
    async mutationFn() {
      return await api.post(undefined, '/logout');
    },
  });
}
