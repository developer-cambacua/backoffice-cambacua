import { describe, it, expect } from "vitest";
import {
  apiDefaultRoles,
  apiRolesMap,
  getAllowedRoles,
  rolesMap,
} from "@/utils/objects/routes";
import { Role } from "@/types/roles";

/* Misma regla que aplica middleware.ts */
const puede = (pathname: string, rol: Role) => {
  const isApi = pathname.startsWith("/api/");
  const allowed = isApi
    ? getAllowedRoles(pathname, apiRolesMap) ?? apiDefaultRoles
    : getAllowedRoles(pathname, rolesMap);
  return !allowed || allowed.length === 0 || allowed.includes(rol);
};

const ROLES: Role[] = ["superAdmin", "admin", "propietario", "limpieza", "appOwner", "dev"];
const operativos: Role[] = ["admin", "superAdmin", "appOwner", "dev"];

/* ruta → roles que DEBEN tener acceso (el resto, no) */
const matriz: [string, Role[]][] = [
  ["/reservas", operativos],
  ["/reservas/carga-1", operativos],
  ["/reservas/carga-2/10", operativos],
  ["/reservas/detalle/10", operativos],
  ["/departamentos/3", operativos],
  ["/reportes/checks/112026", operativos],
  ["/gestionUsuarios", ["superAdmin", "appOwner", "dev"]],
  ["/configuracion", ["appOwner", "dev"]],
  ["/dev", ["dev"]],
  ["/api/reservas", operativos],
  ["/api/reservas/10", operativos],
  ["/api/guests", operativos],
  ["/api/documentacion", operativos],
  ["/api/users", ["superAdmin", "appOwner", "dev"]],
  ["/api/users/3", ["superAdmin", "appOwner", "dev"]],
  ["/api/configuraciones", ["appOwner", "dev"]],
  ["/api/documentacion/antigua", ["appOwner", "dev"]],
  ["/api/notificaciones", ROLES],
  ["/api/notificaciones/gestion", ["appOwner", "dev"]],
  ["/api/notificaciones/gestion/5", ["appOwner", "dev"]],
];

describe("Permisos por rol (middleware)", () => {
  for (const [ruta, permitidos] of matriz) {
    for (const rol of ROLES) {
      const debe = permitidos.includes(rol);
      it(`${rol} ${debe ? "PUEDE" : "NO puede"} entrar a ${ruta}`, () => {
        expect(puede(ruta, rol)).toBe(debe);
      });
    }
  }
});

describe("getAllowedRoles", () => {
  it("usa la clave más específica", () => {
    expect(getAllowedRoles("/api/documentacion/antigua/x", apiRolesMap)).toEqual(["appOwner", "dev"]);
  });

  it("un prefijo no matchea rutas que sólo empiezan igual", () => {
    expect(getAllowedRoles("/reservasXYZ", rolesMap)).toBeUndefined();
  });

  it("las API sin entrada propia usan los roles por defecto", () => {
    expect(getAllowedRoles("/api/reservas", apiRolesMap)).toBeUndefined();
    expect(apiDefaultRoles).toEqual(operativos);
  });

  it("propietario y limpieza no tienen acceso a ninguna página (feature futura)", () => {
    for (const ruta of Object.keys(rolesMap)) {
      expect(puede(ruta, "propietario")).toBe(false);
      expect(puede(ruta, "limpieza")).toBe(false);
    }
  });
});
