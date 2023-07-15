export function roleValueToLabel(value: "super_admin" | "operator" | "") {
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

export function roleLabelToValue(label: string) {
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
