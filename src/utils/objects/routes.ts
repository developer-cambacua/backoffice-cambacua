import { Role } from "@/types/roles";

type RolesMap = {
  [key: string]: Role[]; // clave: ruta (prefijo), valor: roles permitidos. [] = cualquier usuario activo
};

/* Páginas. Aplica a la ruta y a todas sus subrutas (ej. /reservas/carga-1). */
export const rolesMap: RolesMap = {
  "/dev": ["dev"],
  "/tablero": ["admin", "superAdmin", "appOwner", "dev"],
  "/reservas": ["admin", "superAdmin", "appOwner", "dev"],
  "/departamentos": ["admin", "superAdmin", "appOwner", "dev"],
  "/gestionUsuarios": ["superAdmin", "appOwner", "dev"],
  "/reportes": ["admin", "superAdmin", "appOwner", "dev"],
  "/configuracion": ["appOwner", "dev"],
};

/* API routes. Las que no figuran acá usan `apiDefaultRoles`. */
export const apiRolesMap: RolesMap = {
  "/api/users": ["superAdmin", "appOwner", "dev"],
  "/api/configuraciones": ["appOwner", "dev"],
  "/api/notificaciones": [],
};

export const apiDefaultRoles: Role[] = ["admin", "superAdmin", "appOwner", "dev"];

/**
 * Devuelve los roles permitidos para `pathname` buscando la clave más específica
 * que coincida exacta o como prefijo de ruta ("/reservas" cubre "/reservas/carga-1",
 * pero no "/reservasXYZ"). `undefined` si ninguna clave aplica.
 */
export function getAllowedRoles(
  pathname: string,
  map: RolesMap
): Role[] | undefined {
  const match = Object.keys(map)
    .filter((key) => pathname === key || pathname.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length)[0];

  return match ? map[match] : undefined;
}
