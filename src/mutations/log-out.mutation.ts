import { useMutation } from "@tanstack/react-query";
import localforage from "localforage";

export function useLogOutMutation() {
  return useMutation({
    async mutationFn() {
      await localforage.removeItem("logged_in_admin");
    },
  });
}
