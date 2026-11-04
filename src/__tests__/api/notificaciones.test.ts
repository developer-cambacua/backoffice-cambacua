import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { crearSupabaseMock, SupabaseMock } from "../helpers/supabaseMock";

const estado = vi.hoisted(() => ({ mock: null as any }));
vi.mock("@/utils/supabase/admin", () => ({
  get supabaseAdmin() {
    return estado.mock.cliente;
  },
}));

import { GET, POST } from "@/app/api/notificaciones/gestion/route";
import { PATCH, DELETE } from "@/app/api/notificaciones/gestion/[id]/route";

let mock: SupabaseMock;
const usar = (m: SupabaseMock) => {
  mock = m;
  estado.mock = m;
};

const req = (url: string, init?: { method?: string; body?: unknown; rawBody?: string }) =>
  new NextRequest(`http://localhost${url}`, {
    method: init?.method ?? "GET",
    body: init?.rawBody ?? (init?.body !== undefined ? JSON.stringify(init.body) : undefined),
    headers: { "Content-Type": "application/json" },
  });

const params = (id: string) => ({ params: { id } });

const valida = {
  message: "Mantenimiento programado",
  type: "warning",
  visible: true,
  expires_at: "2026-12-02T02:59:59.999Z",
};

beforeEach(() => usar(crearSupabaseMock()));

describe("GET /api/notificaciones/gestion", () => {
  it("lista todas las notificaciones, las más nuevas primero", async () => {
    usar(crearSupabaseMock({ "notifications.select": { data: [{ id: 2 }, { id: 1 }] } }));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 2 }, { id: 1 }]);
    const [consulta] = mock.llamadas;
    expect(consulta.tabla).toBe("notifications");
    expect(mock.filtro(consulta, "order")).toEqual(["id", { ascending: false }]);
    /* a diferencia del GET público, no filtra por visible ni vencimiento */
    expect(mock.filtro(consulta, "eq")).toBeUndefined();
    expect(mock.filtro(consulta, "gte")).toBeUndefined();
  });

  it("error de Supabase → 500", async () => {
    usar(crearSupabaseMock({ "notifications.select": { error: { message: "fallo" } } }));
    expect((await GET()).status).toBe(500);
  });
});

describe("POST /api/notificaciones/gestion", () => {
  it("datos inválidos → 400 sin tocar la base", async () => {
    const res = await POST(req("/api/notificaciones/gestion", { method: "POST", body: { ...valida, type: "rosa" } }));
    expect(res.status).toBe(400);
    expect(mock.llamadas).toHaveLength(0);
  });

  it("JSON inválido → 400", async () => {
    const res = await POST(req("/api/notificaciones/gestion", { method: "POST", rawBody: "{no-json" }));
    expect(res.status).toBe(400);
    expect(mock.llamadas).toHaveLength(0);
  });

  it("datos válidos → 201 e inserta sólo lo validado", async () => {
    usar(crearSupabaseMock({ "notifications.insert": { data: { id: 7 } } }));
    const res = await POST(
      req("/api/notificaciones/gestion", { method: "POST", body: { ...valida, message: "  Hola  ", id: 999 } })
    );
    expect(res.status).toBe(201);
    const [insert] = mock.llamadas;
    expect(insert.accion).toBe("insert");
    expect(insert.args[0]).toEqual([{ ...valida, message: "Hola" }]);
  });

  it("error de Supabase → 500", async () => {
    usar(crearSupabaseMock({ "notifications.insert": { error: { message: "fallo" } } }));
    const res = await POST(req("/api/notificaciones/gestion", { method: "POST", body: valida }));
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/notificaciones/gestion/[id]", () => {
  const patch = (id: string, body: unknown) =>
    PATCH(req(`/api/notificaciones/gestion/${id}`, { method: "PATCH", body }), params(id));

  it("toggle de visible: actualiza sólo ese campo por id", async () => {
    const res = await patch("5", { visible: false });
    expect(res.status).toBe(200);
    const [update] = mock.llamadas;
    expect(update.tabla).toBe("notifications");
    expect(update.accion).toBe("update");
    expect(update.args[0]).toEqual({ visible: false });
    expect(mock.filtro(update, "eq")).toEqual(["id", "5"]);
  });

  it("el id se pasa tal cual (puede ser uuid)", async () => {
    const uuid = "0b9f9a52-6a7c-4a8e-9a43-1d1c0c3f3c11";
    await patch(uuid, { message: "Nuevo" });
    expect(mock.filtro(mock.llamadas[0], "eq")).toEqual(["id", uuid]);
  });

  it("body vacío → 400", async () => {
    const res = await patch("5", {});
    expect(res.status).toBe(400);
    expect(mock.llamadas).toHaveLength(0);
  });

  it("campos desconocidos (ej. id) → 400: no se pueden pisar otras columnas", async () => {
    const res = await patch("5", { id: 1, visible: false });
    expect(res.status).toBe(400);
    expect(mock.llamadas).toHaveLength(0);
  });

  it("valores inválidos → 400", async () => {
    expect((await patch("5", { type: "rosa" })).status).toBe(400);
    expect((await patch("5", { message: "" })).status).toBe(400);
    expect(mock.llamadas).toHaveLength(0);
  });

  it("error de Supabase → 500", async () => {
    usar(crearSupabaseMock({ "notifications.update": { error: { message: "fallo" } } }));
    expect((await patch("5", { visible: true })).status).toBe(500);
  });
});

describe("DELETE /api/notificaciones/gestion/[id]", () => {
  it("borra por id", async () => {
    const res = await DELETE(req("/api/notificaciones/gestion/9", { method: "DELETE" }), params("9"));
    expect(res.status).toBe(200);
    const [del] = mock.llamadas;
    expect(del.accion).toBe("delete");
    expect(mock.filtro(del, "eq")).toEqual(["id", "9"]);
  });

  it("error de Supabase → 500", async () => {
    usar(crearSupabaseMock({ "notifications.delete": { error: { message: "fallo" } } }));
    const res = await DELETE(req("/api/notificaciones/gestion/9", { method: "DELETE" }), params("9"));
    expect(res.status).toBe(500);
  });
});
