import { Admin, AdminSchema } from "@/schemas/admin.schema";
import { NotFoundError } from "@/utils/error.util";
import localforage from "localforage";

export const mockAdminRecords: Admin[] = [
  {
    id: "super-admin-id",
    full_name: "Super Admin",
    email: "superadmin@example.com",
    password: "qwerty123",
    is_active: true,
    role: "super_admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "operator-id",
    full_name: "Operator",
    email: "operator@example.com",
    password: "qwerty123",
    is_active: true,
    role: "operator",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getAdminById(adminId: Admin["id"]): Promise<Admin> {
  const unparsedStoredAdmins = await localforage.getItem("admins");
  const storedAdmins = AdminSchema.array().parse(unparsedStoredAdmins);

  const admin = storedAdmins.find((admin) => admin.id === adminId);

  if (!admin) {
    throw new NotFoundError(`Admin with id ${adminId} not found`);
  }

  return admin;
}
