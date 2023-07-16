import { AdminRole, AdminRoleEnum } from "@/schemas/admin.schema";

export const adminRoleOptions = AdminRoleEnum.options.map((value) => ({
  value,
  label: roleValueToLabel(value),
}));

export function roleValueToLabel(value: AdminRole | "") {
  switch (value) {
    case "super_admin":
      return "Super Admin";
    case "operator":
      return "Operator";
    case "":
      return "All role";
    default:
      throw new Error("Invalid value");
  }
}

export function roleLabelToValue(label: string): AdminRole | "" {
  switch (label) {
    case "Super Admin":
      return "super_admin";
    case "Operator":
      return "operator";
    case "All role":
      return "";
    default:
      throw new Error("Invalid label");
  }
}
