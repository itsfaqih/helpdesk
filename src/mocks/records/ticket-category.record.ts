import { TicketCategory } from "@/schemas/ticket.schema";
import { nanoid } from "nanoid";

export const mockTicketCategoryRecords: TicketCategory[] = [
  {
    id: nanoid(),
    name: "Masalah Pelayanan",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Masalah Menu",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Saran Menu",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(),
    name: "Lainnya",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
