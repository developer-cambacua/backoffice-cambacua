import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { crearSupabaseMock } from "../helpers/supabaseMock";

const estado = vi.hoisted(() => ({
  mock: null as any,
  token: null as null | { email?: string; rol?: string },
}));
vi.mock("@/utils/supabase/admin", () => ({
  get supabaseAdmin() {
    return estado.mock.cliente;
  },
}));
vi.mock("next-auth/jwt", () => ({ getToken: async () => estado.token }));

import { middleware } from "@/middleware";

/** Simula la sesión y la fila de `usuarios` */
const sesion = (usuario: { rol: string; isActive: boolean } | null, email = "ana@cambacua.com") => {
  estado.token = { email, rol: "rol-del-token-ignorado" };
  estado.mock = crearSupabaseMock({
    "usuarios.select": usuario ? { data: usuario } : { data: null, error: { message: "no rows" } },
  });
};

const visitar = (path: string) => middleware(new NextRequest(`http://localhost${path}`));
const pasa = (res: Response) => res.headers.get("x-middleware-next") === "1";
const destino = (res: Response) => new URL(res.headers.get("location") ?? "", "http://localhost").pathname;

beforeEach(() => {
  estado.token = null;
  estado.mock = crearSupabaseMock();
});

describe("middleware: sin sesión", () => {
  it("la API responde 401 JSON", async () => {
    const res = await visitar("/api/reservas");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: "No autorizado" });
  });

  it("las páginas redirigen al login", async () => {
    const res = await visitar("/reservas/carga-1");
    expect(res.status).toBe(307);
    expect(destino(res)).toBe("/");
  });

  it("el login es accesible", async () => {
    expect(pasa(await visitar("/"))).toBe(true);
  });
});

describe("middleware: con sesión", () => {
  it("en el login redirige a /reservas", async () => {
    sesion({ rol: "admin", isActive: true });
    const res = await visitar("/");
    expect(destino(res)).toBe("/reservas");
  });

  it("usuario inactivo → 403 en API y acceso denegado en páginas", async () => {
    sesion({ rol: "admin", isActive: false });
    expect((await visitar("/api/reservas")).status).toBe(403);
    expect(destino(await visitar("/reservas"))).toBe("/access-denied");
  });

  it("usuario que no está en la tabla → 403", async () => {
    sesion(null);
    expect((await visitar("/api/reservas")).status).toBe(403);
  });

  it("admin opera reservas pero no gestiona usuarios ni configuración", async () => {
    sesion({ rol: "admin", isActive: true });
    expect(pasa(await visitar("/api/reservas/5"))).toBe(true);
    expect(pasa(await visitar("/reservas/carga-2/5"))).toBe(true);
    expect((await visitar("/api/users")).status).toBe(403);
    expect((await visitar("/api/configuraciones")).status).toBe(403);
    expect(destino(await visitar("/gestionUsuarios"))).toBe("/access-denied");
  });

  it("superAdmin gestiona usuarios", async () => {
    sesion({ rol: "superAdmin", isActive: true });
    expect(pasa(await visitar("/api/users/3"))).toBe(true);
  });

  it("limpieza no accede a la API de reservas pero sí a notificaciones", async () => {
    sesion({ rol: "limpieza", isActive: true });
    expect((await visitar("/api/reservas")).status).toBe(403);
    expect(pasa(await visitar("/api/notificaciones"))).toBe(true);
  });

  it("el rol se toma de la base, no del token (cambios de rol sin re-login)", async () => {
    sesion({ rol: "limpieza", isActive: true });
    estado.token = { email: "ana@cambacua.com", rol: "appOwner" };
    expect((await visitar("/api/configuraciones")).status).toBe(403);
  });

  it("consulta al usuario por el email de la sesión", async () => {
    sesion({ rol: "admin", isActive: true }, "tami@cambacua.com");
    await visitar("/api/reservas");
    const [consulta] = estado.mock.llamadas;
    expect(consulta.tabla).toBe("usuarios");
    expect(estado.mock.filtro(consulta, "eq")).toEqual(["email", "tami@cambacua.com"]);
  });
});

describe("middleware: errores inesperados", () => {
  it("si Supabase falla, la API devuelve 500 y las páginas van a /error", async () => {
    estado.token = { email: "ana@cambacua.com" };
    estado.mock = {
      cliente: {
        from: () => {
          throw new Error("supabase caído");
        },
      },
    };
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await visitar("/api/reservas")).status).toBe(500);
    expect(destino(await visitar("/reservas"))).toBe("/error");
  });
});
