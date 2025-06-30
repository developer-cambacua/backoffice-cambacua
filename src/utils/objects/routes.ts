import { Role } from "@/types/roles";

type RolesMap = {
  [key: string]: Role[]; // clave: string (ruta), valor: array de roles permitidos
};

export const rolesMap: RolesMap = {
  "/home": ["admin", "superAdmin", "appOwner", "dev", "guest"],
  "/tablero": ["admin", "superAdmin", "appOwner", "dev"],
  "/gestionUsuarios": ["superAdmin", "appOwner", "dev"],
  "/departamentos": ["admin", "superAdmin", "appOwner", "dev"],
  "/reservas": ["admin", "superAdmin", "appOwner", "dev"],
  "/profile": ["admin", "superAdmin", "propietario", "appOwner", "dev"],
  "/dev": ["dev"],
};
