export function roleToLabel(role: "super_admin" | "operator") {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "operator":
      return "Operator";
    default:
      throw new Error("Invalid role");
  }
}
