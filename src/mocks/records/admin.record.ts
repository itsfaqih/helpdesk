import { Admin } from "@/schemas/admin.schema";

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
