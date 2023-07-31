import {
  TicketAssigmentWithRelations,
  TicketWithRelations,
} from "@/schemas/ticket.schema";
import { nanoid } from "nanoid";
import { mockClientRecords } from "./client.record";
import { mockTicketCategoryRecords } from "./ticket-category.record";
import { mockChannelRecords } from "./channel.record";
import { mockAdminRecords } from "./admin.record";

export const mockTicketRecords: TicketWithRelations[] = [
  {
    id: nanoid(),
    category_id: mockTicketCategoryRecords[0].id,
    channel_id: mockChannelRecords[0].id,
    client_id: mockClientRecords[0].id,
    title: "Staf kurang ramah",
    description: `Gue mau lapor nih tentang pengalaman gue di Restoran XYZ. Jadi ceritanya, gue tuh nyoba mampir ke restoran itu pada tanggal XX/XX/XXXX, dan wah, bener-bener kecewa deh sama pelayanannya. Stafnya tuh kurang ramah banget, pelayanannya juga lama banget, dan gak jarang pesenan gue dikasih yang salah, gitu loh!\nJadi, beneran deh, gue harap banget masalah ini bisa diatasi dengan serius dan diperbaiki secepatnya. Gue pengen kasih masukan yang membangun biar pengalaman nyokap-nyokap Jakarta Selatan yang lain juga bisa lebih kece di restoran ini.`,
    status: "open",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: mockTicketCategoryRecords[0],
    channel: mockChannelRecords[0],
    client: mockClientRecords[0],
    assignments: [],
  },
  {
    id: nanoid(),
    category_id: mockTicketCategoryRecords[2].id,
    channel_id: mockChannelRecords[1].id,
    client_id: mockClientRecords[0].id,
    title: "Saran Menu Makanan: Sate Ayam",
    status: "open",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: mockTicketCategoryRecords[2],
    channel: mockChannelRecords[1],
    client: mockClientRecords[0],
    assignments: [],
  },
  {
    id: nanoid(),
    category_id: mockTicketCategoryRecords[0].id,
    channel_id: mockChannelRecords[2].id,
    client_id: mockClientRecords[1].id,
    title: "Staf kurang ramah, pelayanan lelet",
    description: `Jadi, ceritanya pas aku kesana tanggal XX/XX/XXXX, aku bener-bener kecewa sama pelayanannya. Stafnya kurang ramah banget, pelayanannya juga lama banget, dan kadang pesenan aku dikasih yang salah, gitu loh!`,
    status: "open",
    is_archived: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: mockTicketCategoryRecords[0],
    channel: mockChannelRecords[2],
    client: mockClientRecords[1],
    assignments: [],
  },
  {
    id: nanoid(),
    category_id: mockTicketCategoryRecords[1].id,
    channel_id: mockChannelRecords[3].id,
    client_id: mockClientRecords[1].id,
    title: "Makanannya basi",
    status: "open",
    is_archived: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: mockTicketCategoryRecords[1],
    channel: mockChannelRecords[3],
    client: mockClientRecords[1],
    assignments: [],
  },
];

export const mockTicketAssignments: TicketAssigmentWithRelations[] = [
  {
    id: nanoid(),
    ticket_id: mockTicketRecords[0].id,
    admin_id: mockAdminRecords[0].id,
    created_at: new Date().toISOString(),
    ticket: mockTicketRecords[0],
    admin: mockAdminRecords[0],
  },
  {
    id: nanoid(),
    ticket_id: mockTicketRecords[1].id,
    admin_id: mockAdminRecords[1].id,
    created_at: new Date().toISOString(),
    ticket: mockTicketRecords[1],
    admin: mockAdminRecords[1],
  },
];
