import { LoginSchema, RegisterSchema } from "@/schemas/auth.schema";
import {
  Admin,
  AdminSchema,
  AdminWithoutPasswordSchema,
  CreateAdminSchema,
  UpdateAdminSchema,
} from "@/schemas/admin.schema";
import localforage from "localforage";
import { rest } from "msw";
import { errorResponse, successResponse } from "./res";
import { nanoid } from "nanoid";
import { AdminIndexRequestSchema } from "@/queries/admin.query";
import { generatePaginationMeta } from "@/utils/api.util";
import {
  Client,
  ClientSchema,
  CreateClientSchema,
  UpdateClientSchema,
} from "@/schemas/client.schema";
import { ClientIndexRequestSchema } from "@/queries/client.query";
import {
  CreateTicketCategorySchema,
  CreateTicketSchema,
  Ticket,
  TicketCategory,
  TicketCategorySchema,
  TicketSchema,
  UpdateTicketCategorySchema,
} from "@/schemas/ticket.schema";
import {
  TicketCategoryIndexRequestSchema,
  TicketIndexRequestSchema,
} from "@/queries/ticket.query";

export const authHandlers = [
  rest.post("/api/login", async (req) => {
    const data = LoginSchema.parse(await req.json());
    const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const admin = storedAdmins.find(
      (admin) => admin.email === data.email && admin.password === data.password
    );

    if (admin) {
      return successResponse({
        data: admin,
        message: "Successfully authenticated",
      });
    }

    return errorResponse({
      message: "Email or password is invalid",
      status: 401,
    });
  }),
  rest.post("/api/register", async (req) => {
    const data = RegisterSchema.parse(await req.json());
    const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const isAdminExisted = storedAdmins.some(
      (admin) => admin.email === data.email
    );

    if (isAdminExisted) {
      return errorResponse({
        message: "Email is already registered",
        status: 409,
      });
    }

    const newAdmin: Admin = {
      id: nanoid(),
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      role: "super_admin",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newAdmins = [...storedAdmins, newAdmin];

    await localforage.setItem("admins", newAdmins);
    await localforage.setItem("logged_in_admin", newAdmin);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...newAdminWithoutPassword } = newAdmin;

    return successResponse({
      data: newAdminWithoutPassword,
      message: "Successfully registered admin",
    });
  }),
  rest.get("/api/me", async () => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const loggedInAdmin = AdminWithoutPasswordSchema.parse(
      unparsedLoggedInAdmin
    );

    return successResponse({
      data: loggedInAdmin,
      message: "Successfully retrieved current admin",
    });
  }),
];

export const adminHandlers = [
  rest.post("/api/admins", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const loggedInAdmin = AdminWithoutPasswordSchema.parse(
      unparsedLoggedInAdmin
    );

    if (loggedInAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const data = CreateAdminSchema.parse(await req.json());

    const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const isAdminExisted = storedAdmins.some(
      (admin) => admin.email === data.email
    );

    if (isAdminExisted) {
      return errorResponse({
        message: "Email is already registered",
        status: 409,
      });
    }

    const newAdmin: Admin = {
      id: nanoid(),
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      role: data.role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newAdmins = [...storedAdmins, newAdmin];

    await localforage.setItem("admins", newAdmins);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...newAdminWithoutPassword } = newAdmin;

    return successResponse({
      data: newAdminWithoutPassword,
      message: "Successfully created admin",
    });
  }),
  rest.put("/api/admins/:adminId", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const loggedInAdmin = AdminWithoutPasswordSchema.parse(
      unparsedLoggedInAdmin
    );

    if (loggedInAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const data = UpdateAdminSchema.parse(await req.json());

    const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const adminId = req.params.adminId;

    const adminToUpdate = storedAdmins.find((admin) => admin.id === adminId);

    if (!adminToUpdate) {
      return errorResponse({
        message: "Admin is not found",
        status: 404,
      });
    }

    const updatedAdmin: Admin = {
      ...adminToUpdate,
      full_name: data.full_name,
      role: data.role,
      updated_at: new Date().toISOString(),
    };

    const newAdmins = storedAdmins.map((admin) =>
      admin.id === adminId ? updatedAdmin : admin
    );

    await localforage.setItem("admins", newAdmins);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...updatedAdminWithoutPassword } = updatedAdmin;

    return successResponse({
      data: updatedAdminWithoutPassword,
      message: "Successfully updated admin",
    });
  }),
  rest.get("/api/admins", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const unparsedFilters = Object.fromEntries(req.url.searchParams);
    const filters = AdminIndexRequestSchema.parse(unparsedFilters);

    const filteredAdmins = storedAdmins.filter((admin) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();

        const isMatched =
          admin.full_name.toLowerCase().includes(search) ||
          admin.email.toLowerCase().includes(search);

        if (!isMatched) {
          return false;
        }
      }

      if (filters.role) {
        if (admin.role !== filters.role) {
          return false;
        }
      }

      if (filters.is_active) {
        if (filters.is_active === "1" && !admin.is_active) {
          return false;
        } else if (filters.is_active === "0" && admin.is_active) {
          return false;
        }
      } else {
        return admin.is_active;
      }

      return true;
    });

    const page = filters.page ?? 1;

    const paginatedAdmins = filteredAdmins.slice((page - 1) * 10, page * 10);

    return successResponse({
      data: paginatedAdmins,
      message: "Successfully retrieved admins",
      meta: {
        ...generatePaginationMeta({
          currentPage: page,
          total: filteredAdmins.length,
        }),
      },
    });
  }),
  rest.get("/api/admins/:adminId", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const adminId = req.params.adminId;

    const admin = storedAdmins.find((admin) => admin.id === adminId);

    if (!admin) {
      return errorResponse({
        message: "Admin is not found",
        status: 404,
      });
    }

    return successResponse({
      data: admin,
      message: "Successfully retrieved admin",
    });
  }),
  rest.put("/api/admins/:adminId/deactivate", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const loggedInAdmin = AdminWithoutPasswordSchema.parse(
      unparsedLoggedInAdmin
    );

    if (loggedInAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const adminId = req.params.adminId;

    const adminToUpdate = storedAdmins.find((admin) => admin.id === adminId);

    if (!adminToUpdate) {
      return errorResponse({
        message: "Admin is not found",
        status: 404,
      });
    }

    const updatedAdmin: Admin = {
      ...adminToUpdate,
      is_active: false,
      updated_at: new Date().toISOString(),
    };

    const newAdmins = storedAdmins.map((admin) =>
      admin.id === adminId ? updatedAdmin : admin
    );

    await localforage.setItem("admins", newAdmins);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...updatedAdminWithoutPassword } = updatedAdmin;

    return successResponse({
      data: updatedAdminWithoutPassword,
      message: "Successfully deactivated admin",
    });
  }),
  rest.put("/api/admins/:adminId/activate", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const loggedInAdmin = AdminWithoutPasswordSchema.parse(
      unparsedLoggedInAdmin
    );

    if (loggedInAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const unparsedStoredAdmins = (await localforage.getItem("admins")) ?? [];
    const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

    const adminId = req.params.adminId;

    const adminToUpdate = storedAdmins.find((admin) => admin.id === adminId);

    if (!adminToUpdate) {
      return errorResponse({
        message: "Admin is not found",
        status: 404,
      });
    }

    const updatedAdmin: Admin = {
      ...adminToUpdate,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const newAdmins = storedAdmins.map((admin) =>
      admin.id === adminId ? updatedAdmin : admin
    );

    await localforage.setItem("admins", newAdmins);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...updatedAdminWithoutPassword } = updatedAdmin;

    return successResponse({
      data: updatedAdminWithoutPassword,
      message: "Successfully activated admin",
    });
  }),
];

export const clientHandlers = [
  rest.post("/api/clients", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const loggedInAdmin = AdminWithoutPasswordSchema.parse(
      unparsedLoggedInAdmin
    );

    if (loggedInAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const data = CreateClientSchema.parse(await req.json());

    const unparsedStoredAdmins = (await localforage.getItem("clients")) ?? [];
    const storedAdmins = ClientSchema.array().parse(unparsedStoredAdmins);

    const isClientExisted = storedAdmins.some(
      (client) => client.full_name === data.full_name
    );

    if (isClientExisted) {
      return errorResponse({
        message: "Client with the same name is already registered",
        status: 409,
      });
    }

    const newClient: Client = {
      id: nanoid(),
      full_name: data.full_name,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newClients = [...storedAdmins, newClient];

    await localforage.setItem("clients", newClients);

    return successResponse({
      data: newClient,
      message: "Successfully created client",
    });
  }),
  rest.put("/api/clients/:clientId", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const loggedInAdmin = AdminWithoutPasswordSchema.parse(
      unparsedLoggedInAdmin
    );

    if (loggedInAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const data = UpdateClientSchema.parse(await req.json());

    const unparsedStoredClients = (await localforage.getItem("clients")) ?? [];
    const storedClients = ClientSchema.array().parse(unparsedStoredClients);

    const clientId = req.params.clientId;

    const clientToUpdate = storedClients.find(
      (client) => client.id === clientId
    );

    if (!clientToUpdate) {
      return errorResponse({
        message: "Client is not found",
        status: 404,
      });
    }

    const updatedClient: Client = {
      ...clientToUpdate,
      full_name: data.full_name,
      updated_at: new Date().toISOString(),
    };

    const newClients = storedClients.map((client) =>
      client.id === clientId ? updatedClient : client
    );

    await localforage.setItem("clients", newClients);

    return successResponse({
      data: updatedClient,
      message: "Successfully updated client",
    });
  }),
  rest.get("/api/clients", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const unparsedStoredClients = (await localforage.getItem("clients")) ?? [];
    const storedClients = ClientSchema.array().parse(unparsedStoredClients);

    const unparsedFilters = Object.fromEntries(req.url.searchParams);
    const filters = ClientIndexRequestSchema.parse(unparsedFilters);

    const filteredClients = storedClients.filter((client) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();

        const isMatched = client.full_name.toLowerCase().includes(search);

        if (!isMatched) {
          return false;
        }
      }

      if (filters.is_archived) {
        if (filters.is_archived === "1" && !client.is_archived) {
          return false;
        } else if (filters.is_archived === "0" && client.is_archived) {
          return false;
        }
      } else {
        return client.is_archived === false;
      }

      return true;
    });

    const page = filters.page ?? 1;

    const paginatedClients = filteredClients.slice((page - 1) * 10, page * 10);

    return successResponse({
      data: paginatedClients,
      message: "Successfully retrieved clients",
      meta: {
        ...generatePaginationMeta({
          currentPage: page,
          total: filteredClients.length,
        }),
      },
    });
  }),
  rest.get("/api/clients/:clientId", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const unparsedStoredClients = (await localforage.getItem("clients")) ?? [];
    const storedClients = ClientSchema.array().parse(unparsedStoredClients);

    const clientId = req.params.clientId;

    const client = storedClients.find((client) => client.id === clientId);

    if (!client) {
      return errorResponse({
        message: "Client is not found",
        status: 404,
      });
    }

    return successResponse({
      data: client,
      message: "Successfully retrieved client",
    });
  }),
  rest.put("/api/clients/:clientId/archive", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const parsedUnparsedLoggedInAdmin = AdminWithoutPasswordSchema.parse(
      unparsedLoggedInAdmin
    );

    if (parsedUnparsedLoggedInAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const unparsedStoredClient = (await localforage.getItem("clients")) ?? [];
    const storedClients = ClientSchema.array().parse(unparsedStoredClient);

    const clientId = req.params.clientId;

    const clientToUpdate = storedClients.find(
      (client) => client.id === clientId
    );

    if (!clientToUpdate) {
      return errorResponse({
        message: "Client is not found",
        status: 404,
      });
    }

    const updatedClient: Client = {
      ...clientToUpdate,
      is_archived: true,
      updated_at: new Date().toISOString(),
    };

    const newClients = storedClients.map((client) =>
      client.id === clientId ? updatedClient : client
    );

    await localforage.setItem("clients", newClients);

    return successResponse({
      data: updatedClient,
      message: "Successfully archived client",
    });
  }),
  rest.put("/api/clients/:clientId/restore", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const parsedUnparsedLoggedInAdmin = AdminWithoutPasswordSchema.parse(
      unparsedLoggedInAdmin
    );

    if (parsedUnparsedLoggedInAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const unparsedStoredClients = (await localforage.getItem("clients")) ?? [];
    const storedClients = ClientSchema.array().parse(unparsedStoredClients);

    const clientId = req.params.clientId;

    const clientToUpdate = storedClients.find(
      (client) => client.id === clientId
    );

    if (!clientToUpdate) {
      return errorResponse({
        message: "Client is not found",
        status: 404,
      });
    }

    const updatedClient: Client = {
      ...clientToUpdate,
      is_archived: false,
      updated_at: new Date().toISOString(),
    };

    const newClients = storedClients.map((client) =>
      client.id === clientId ? updatedClient : client
    );

    await localforage.setItem("clients", newClients);

    return successResponse({
      data: updatedClient,
      message: "Successfully activated client",
    });
  }),
];

export const ticketHandlers = [
  rest.post("/api/tickets", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const data = CreateTicketSchema.parse(await req.json());

    const unparsedStoredAdmins = (await localforage.getItem("tickets")) ?? [];
    const storedAdmins = TicketSchema.array().parse(unparsedStoredAdmins);

    const newTicket: Ticket = {
      id: nanoid(),
      title: data.title,
      platform: "System",
      status: "open",
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client_id: data.client_id,
      category_id: data.category_id,
    };

    const newTickets = [...storedAdmins, newTicket];

    await localforage.setItem("tickets", newTickets);

    return successResponse({
      data: newTicket,
      message: "Successfully created ticket",
    });
  }),
  rest.get("/api/tickets", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const unparsedStoredTickets = (await localforage.getItem("tickets")) ?? [];
    const storedTickets = TicketSchema.array().parse(unparsedStoredTickets);

    const unparsedFilters = Object.fromEntries(req.url.searchParams);
    const filters = TicketIndexRequestSchema.parse(unparsedFilters);

    const filteredTickets = storedTickets.filter((ticket) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();

        const isMatched = ticket.title.toLowerCase().includes(search);

        if (!isMatched) {
          return false;
        }
      }

      if (filters.status) {
        if (ticket.status !== filters.status) {
          return false;
        }
      }

      if (filters.category_id) {
        if (ticket.category_id !== filters.category_id) {
          return false;
        }
      }

      if (filters.is_archived) {
        if (filters.is_archived === "1" && !ticket.is_archived) {
          return false;
        } else if (filters.is_archived === "0" && ticket.is_archived) {
          return false;
        }
      } else {
        return ticket.is_archived === false;
      }

      return true;
    });

    const page = filters.page ?? 1;

    const paginatedTickets = filteredTickets.slice((page - 1) * 10, page * 10);

    return successResponse({
      data: paginatedTickets,
      message: "Successfully retrieved tickets",
      meta: {
        ...generatePaginationMeta({
          currentPage: page,
          total: filteredTickets.length,
        }),
      },
    });
  }),
  rest.get("/api/tickets/:ticketId", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const unparsedStoredTickets = (await localforage.getItem("tickets")) ?? [];
    const storedTickets = TicketSchema.array().parse(unparsedStoredTickets);

    const ticketId = req.params.ticketId;

    const ticket = storedTickets.find((ticket) => ticket.id === ticketId);

    if (!ticket) {
      return errorResponse({
        message: "Ticket is not found",
        status: 404,
      });
    }

    return successResponse({
      data: ticket,
      message: "Successfully retrieved ticket",
    });
  }),
  rest.put("/api/tickets/:ticketId/archive", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const unparsedStoredTickets = (await localforage.getItem("tickets")) ?? [];
    const storedTickets = TicketSchema.array().parse(unparsedStoredTickets);

    const ticketId = req.params.ticketId;

    const ticketToUpdate = storedTickets.find(
      (ticket) => ticket.id === ticketId
    );

    if (!ticketToUpdate) {
      return errorResponse({
        message: "Ticket is not found",
        status: 404,
      });
    }

    const updatedTicket: Ticket = {
      ...ticketToUpdate,
      is_archived: true,
      updated_at: new Date().toISOString(),
    };

    const newTickets = storedTickets.map((ticket) =>
      ticket.id === ticketId ? updatedTicket : ticket
    );

    await localforage.setItem("tickets", newTickets);

    return successResponse({
      data: updatedTicket,
      message: "Successfully archived ticket",
    });
  }),
  rest.put("/api/tickets/:ticketId/restore", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const parsedUnparsedLoggedInAdmin = AdminWithoutPasswordSchema.parse(
      unparsedLoggedInAdmin
    );

    if (parsedUnparsedLoggedInAdmin.role !== "super_admin") {
      return errorResponse({
        message: "Forbidden",
        status: 403,
      });
    }

    const unparsedStoredTickets = (await localforage.getItem("tickets")) ?? [];
    const storedTickets = TicketSchema.array().parse(unparsedStoredTickets);

    const ticketId = req.params.ticketId;

    const ticketToUpdate = storedTickets.find(
      (ticket) => ticket.id === ticketId
    );

    if (!ticketToUpdate) {
      return errorResponse({
        message: "Ticket is not found",
        status: 404,
      });
    }

    const updatedTicket: Ticket = {
      ...ticketToUpdate,
      is_archived: false,
      updated_at: new Date().toISOString(),
    };

    const newTickets = storedTickets.map((ticket) =>
      ticket.id === ticketId ? updatedTicket : ticket
    );

    await localforage.setItem("tickets", newTickets);

    return successResponse({
      data: updatedTicket,
      message: "Successfully activated ticket",
    });
  }),
];

export const ticketCategoryHandlers = [
  rest.post("/api/ticket-categories", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const data = CreateTicketCategorySchema.parse(await req.json());

    const unparsedStoredTicketCategories =
      (await localforage.getItem("ticket_categories")) ?? [];
    const storedTicketCategories = TicketCategorySchema.array().parse(
      unparsedStoredTicketCategories
    );

    const newTicketCategory: TicketCategory = {
      id: nanoid(),
      name: data.name,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newTicketCategories = [...storedTicketCategories, newTicketCategory];

    await localforage.setItem("ticket_categories", newTicketCategories);

    return successResponse({
      data: newTicketCategory,
      message: "Successfully created ticket category",
    });
  }),
  rest.get("/api/ticket-categories", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const unparsedStoredTicketCategories =
      (await localforage.getItem("ticket_categories")) ?? [];
    const storedTicketCategories = TicketCategorySchema.array().parse(
      unparsedStoredTicketCategories
    );

    const unparsedFilters = Object.fromEntries(req.url.searchParams);
    const filters = TicketCategoryIndexRequestSchema.parse(unparsedFilters);

    const filteredTicketCategories = storedTicketCategories.filter(
      (ticketCategory) => {
        if (filters.search) {
          const search = filters.search.toLowerCase();

          const isMatched = ticketCategory.name.toLowerCase().includes(search);

          if (!isMatched) {
            return false;
          }
        }

        if (filters.is_archived) {
          if (filters.is_archived === "1" && !ticketCategory.is_archived) {
            return false;
          } else if (
            filters.is_archived === "0" &&
            ticketCategory.is_archived
          ) {
            return false;
          }
        }

        return true;
      }
    );

    return successResponse({
      data: filteredTicketCategories,
      message: "Successfully retrieved ticket categories",
    });
  }),
  rest.get("/api/ticket-categories/:ticketCategoryId", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        message: "Unauthorized",
        status: 401,
      });
    }

    const unparsedStoredTicketCategories =
      (await localforage.getItem("ticket_categories")) ?? [];
    const storedTicketCategories = TicketCategorySchema.array().parse(
      unparsedStoredTicketCategories
    );

    const ticketCategoryId = req.params.ticketCategoryId;

    const ticketCategory = storedTicketCategories.find(
      (ticketCategory) => ticketCategory.id === ticketCategoryId
    );

    if (!ticketCategory) {
      return errorResponse({
        message: "Ticket category is not found",
        status: 404,
      });
    }

    return successResponse({
      data: ticketCategory,
      message: "Successfully retrieved ticket category",
    });
  }),
  rest.put("/api/ticket-categories/:ticketCategoryId", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
      });
    }

    const data = UpdateTicketCategorySchema.parse(await req.json());

    const unparsedStoredTicketCategories =
      (await localforage.getItem("ticket_categories")) ?? [];
    const storedTicketCategories = TicketCategorySchema.array().parse(
      unparsedStoredTicketCategories
    );

    const ticketCategoryId = req.params.ticketCategoryId;

    const ticketCategoryToUpdate = storedTicketCategories.find(
      (ticketCategory) => ticketCategory.id === ticketCategoryId
    );

    if (!ticketCategoryToUpdate) {
      return errorResponse({
        message: "Ticket category is not found",
        status: 404,
      });
    }

    const updatedTicketCategory: TicketCategory = {
      ...ticketCategoryToUpdate,
      ...data,
      updated_at: new Date().toISOString(),
    };

    const newTicketCategories = storedTicketCategories.map((ticketCategory) =>
      ticketCategory.id === ticketCategoryId
        ? updatedTicketCategory
        : ticketCategory
    );

    await localforage.setItem("ticket_categories", newTicketCategories);

    return successResponse({
      data: updatedTicketCategory,
      message: "Successfully updated ticket category",
    });
  }),
  rest.put("/api/ticket-categories/:ticketCategoryId/archive", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
      });
    }

    const unparsedStoredTicketCategories =
      (await localforage.getItem("ticket_categories")) ?? [];
    const storedTicketCategories = TicketCategorySchema.array().parse(
      unparsedStoredTicketCategories
    );

    const ticketCategoryId = req.params.ticketCategoryId;

    const ticketCategoryToUpdate = storedTicketCategories.find(
      (ticketCategory) => ticketCategory.id === ticketCategoryId
    );

    if (!ticketCategoryToUpdate) {
      return errorResponse({
        message: "Ticket category is not found",
        status: 404,
      });
    }

    const updatedTicketCategory: TicketCategory = {
      ...ticketCategoryToUpdate,
      is_archived: true,
      updated_at: new Date().toISOString(),
    };

    const newTicketCategories = storedTicketCategories.map((ticketCategory) =>
      ticketCategory.id === ticketCategoryId
        ? updatedTicketCategory
        : ticketCategory
    );

    await localforage.setItem("ticket_categories", newTicketCategories);

    return successResponse({
      data: updatedTicketCategory,
      message: "Successfully archived ticket category",
    });
  }),
  rest.put("/api/ticket-categories/:ticketCategoryId/restore", async (req) => {
    const unparsedLoggedInAdmin = await localforage.getItem("logged_in_admin");

    if (!unparsedLoggedInAdmin) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
      });
    }

    const unparsedStoredTicketCategories =
      (await localforage.getItem("ticket_categories")) ?? [];
    const storedTicketCategories = TicketCategorySchema.array().parse(
      unparsedStoredTicketCategories
    );

    const ticketCategoryId = req.params.ticketCategoryId;

    const ticketCategoryToUpdate = storedTicketCategories.find(
      (ticketCategory) => ticketCategory.id === ticketCategoryId
    );

    if (!ticketCategoryToUpdate) {
      return errorResponse({
        message: "Ticket category is not found",
        status: 404,
      });
    }

    const updatedTicketCategory: TicketCategory = {
      ...ticketCategoryToUpdate,
      is_archived: false,
      updated_at: new Date().toISOString(),
    };

    const newTicketCategories = storedTicketCategories.map((ticketCategory) =>
      ticketCategory.id === ticketCategoryId
        ? updatedTicketCategory
        : ticketCategory
    );

    await localforage.setItem("ticket_categories", newTicketCategories);

    return successResponse({
      data: updatedTicketCategory,
      message: "Successfully restored ticket category",
    });
  }),
];

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
  ...clientHandlers,
  ...ticketHandlers,
  ...ticketCategoryHandlers,
];
