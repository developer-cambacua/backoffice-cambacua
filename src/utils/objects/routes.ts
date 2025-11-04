import { Role } from "@/types/roles";

type RolesMap = {
  [key: string]: Role[]; // clave: string (ruta), valor: array de roles permitidos
};

export const rolesMap: RolesMap = {
  "/dev": ["dev"],
  "/tablero": ["admin", "superAdmin", "appOwner", "dev"],
  "/reservas": ["admin", "superAdmin", "appOwner", "dev"],
  "/departamentos": ["admin", "superAdmin", "appOwner", "dev"],
  "/gestionUsuarios": ["superAdmin", "appOwner", "dev"],
  "/reportes": ["admin", "superAdmin", "appOwner", "dev"],
  "/configuracion": ["appOwner", "dev"],
};
