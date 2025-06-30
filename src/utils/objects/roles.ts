import { Role } from "@/types/roles";

export const roleOptions: { key: string; label: string; value: Role }[] = [
  { key: "superAdmin", label: "Super admin", value: "superAdmin" },
  { key: "administrator", label: "Admin", value: "admin" },
  { key: "propietario", label: "Propietario", value: "propietario" },
  { key: "empleado-limpieza", label: "Limpieza", value: "limpieza" },
  // { label: "Developer", value: "dev" },
  // { label: "App Owner", value: "appOwner" },
  // { label: "Invitado", value: "guest" },
];
