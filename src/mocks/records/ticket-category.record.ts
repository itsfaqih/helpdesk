import { TicketCategory, TicketCategorySchema } from "@/schemas/ticket.schema";
import localforage from "localforage";
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

export async function getTicketCategories(): Promise<TicketCategory[]> {
  const unparsedStoredTicketCategories = await localforage.getItem(
    "ticket_categories"
  );
  const storedTicketCategories = TicketCategorySchema.array().parse(
    unparsedStoredTicketCategories
  );

  return storedTicketCategories;
}

export async function getTicketCategoryById(
  ticketCategoryId: TicketCategory["id"]
): Promise<TicketCategory> {
  const unparsedStoredTicketCategories = await localforage.getItem(
    "ticket_categories"
  );
  const storedTicketCategories = TicketCategorySchema.array().parse(
    unparsedStoredTicketCategories
  );

  const ticketCategory = storedTicketCategories.find(
    (ticketCategory) => ticketCategory.id === ticketCategoryId
  );

  if (!ticketCategory) {
    throw new Error(`Ticket category with id ${ticketCategoryId} is not found`);
  }

  return ticketCategory;
}
