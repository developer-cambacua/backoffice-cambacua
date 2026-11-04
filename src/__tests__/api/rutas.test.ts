import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { crearSupabaseMock, SupabaseMock } from "../helpers/supabaseMock";

/* El mismo mock sirve para los dos clientes del server (admin y @supabase/ssr) */
const estado = vi.hoisted(() => ({ mock: null as any }));
vi.mock("@/utils/supabase/admin", () => ({
  get supabaseAdmin() {
    return estado.mock.cliente;
  },
}));
vi.mock("@/utils/supabase/server", () => ({
  createServerSupabase: async () => estado.mock.cliente,
}));

import { POST as crearReserva } from "@/app/api/reservas/route";
import { PATCH as actualizarReserva, GET as obtenerReserva } from "@/app/api/reservas/[id]/route";
import { GET as buscarHuespedes, POST as crearHuesped } from "@/app/api/guests/route";
import { GET as listarEmpleados } from "@/app/api/empleados/route";

let mock: SupabaseMock;
const usar = (m: SupabaseMock) => {
  mock = m;
  estado.mock = m;
};

const req = (url: string, init?: { method?: string; body?: unknown }) =>
  new NextRequest(`http://localhost${url}`, {
    method: init?.method ?? "GET",
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => usar(crearSupabaseMock()));

describe("POST /api/reservas", () => {
  const valida = {
    departamento_id: 1, nombre_completo: "Ana Pérez", telefono_provisorio: "1122334455",
    cantidad_huespedes: 2, numero_reserva: "R123456", app_reserva: "booking",
    fecha_ingreso: "2026-01-10T03:00:00.000Z", fecha_egreso: "2026-01-13T03:00:00.000Z",
    check_in: "9", check_out: "11:00", valor_reserva: "120", estado_reserva: "reservado",
  };

  it("datos inválidos → 400 sin tocar la base", async () => {
    const res = await crearReserva(req("/api/reservas", { method: "POST", body: { ...valida, telefono_provisorio: "11 22" } }));
    expect(res.status).toBe(400);
    expect(mock.llamadas).toHaveLength(0);
  });

  it("datos válidos → 201 e inserta lo validado (con la hora normalizada)", async () => {
    usar(crearSupabaseMock({ "reservas.insert": { data: { id: 99 } } }));
    const res = await crearReserva(req("/api/reservas", { method: "POST", body: valida }));
    expect(res.status).toBe(201);
    const [insert] = mock.llamadas;
    expect(insert.tabla).toBe("reservas");
    expect(insert.accion).toBe("insert");
    const [fila] = insert.args[0] as any[];
    expect(fila.check_in).toBe("09:00");
    expect(fila.estado_reserva).toBe("reservado");
  });

  it("error de Supabase → 500", async () => {
    usar(crearSupabaseMock({ "reservas.insert": { error: { message: "fallo" } } }));
    const res = await crearReserva(req("/api/reservas", { method: "POST", body: valida }));
    expect(res.status).toBe(500);
  });
});

describe("/api/reservas/[id]", () => {
  const params = (id: string) => ({ params: { id } });

  it("GET con id inválido → 400", async () => {
    const res = await obtenerReserva(req("/api/reservas/abc"), params("abc"));
    expect(res.status).toBe(400);
  });

  it("PATCH con id inválido → 400", async () => {
    const res = await actualizarReserva(req("/api/reservas/abc", { method: "PATCH", body: {} }), params("abc"));
    expect(res.status).toBe(400);
  });

  it("PATCH de carga 3: borra los responsables previos ANTES de insertar (reintento sin duplicados)", async () => {
    const body = {
      estado_reserva: "completado",
      responsables_limpieza: [
        { empleado_id: 3, hora_ingreso_limpieza: "10:00", hora_egreso_limpieza: "12:30" },
        { empleado_id: 4, hora_ingreso_limpieza: "23:30", hora_egreso_limpieza: "01:00" },
      ],
    };
    const res = await actualizarReserva(req("/api/reservas/7", { method: "PATCH", body }), params("7"));
    expect(res.status).toBe(200);

    const [borrado, insercion, update] = mock.llamadas;
    expect([borrado.tabla, borrado.accion]).toEqual(["responsables_limpieza", "delete"]);
    expect(mock.filtro(borrado, "eq")).toEqual(["reserva_id", 7]);

    expect([insercion.tabla, insercion.accion]).toEqual(["responsables_limpieza", "insert"]);
    expect(insercion.args[0]).toEqual([
      { reserva_id: 7, empleado_id: 3, hora_ingreso: "10:00", hora_egreso: "12:30", tiempo_limpieza: "2:30" },
      { reserva_id: 7, empleado_id: 4, hora_ingreso: "23:30", hora_egreso: "01:00", tiempo_limpieza: "1:30" },
    ]);

    expect([update.tabla, update.accion]).toEqual(["reservas", "update"]);
    expect(update.args[0]).toEqual({ estado_reserva: "completado" });
    expect(mock.filtro(update, "eq")).toEqual(["id", 7]);
  });

  it("PATCH sin responsables (carga 2 / cancelar) sólo actualiza la reserva", async () => {
    const res = await actualizarReserva(
      req("/api/reservas/7", { method: "PATCH", body: { estado_reserva: "cancelado" } }),
      params("7")
    );
    expect(res.status).toBe(200);
    expect(mock.llamadas.map((c) => `${c.tabla}.${c.accion}`)).toEqual(["reservas.update"]);
  });

  it("si falla el borrado de responsables no inserta ni actualiza", async () => {
    usar(crearSupabaseMock({ "responsables_limpieza.delete": { error: { message: "rls" } } }));
    const body = { responsables_limpieza: [{ empleado_id: 3, hora_ingreso_limpieza: "10:00", hora_egreso_limpieza: "11:00" }] };
    const res = await actualizarReserva(req("/api/reservas/7", { method: "PATCH", body }), params("7"));
    expect(res.status).toBe(400);
    expect(mock.llamadas).toHaveLength(1);
  });
});

describe("/api/guests", () => {
  const huesped = {
    tipo_identificacion: "DNI", numero_identificacion: "30123456", nombre: "Ana",
    apellido: "Pérez", email: "a@a.com", telefono: "1122334455", nacionalidad: "Argentina",
  };

  it("POST con documento ya cargado → 409 y no inserta", async () => {
    usar(crearSupabaseMock({ "huespedes.select": { data: { id: 5 } } }));
    const res = await crearHuesped(req("/api/guests", { method: "POST", body: huesped }));
    expect(res.status).toBe(409);
    expect(mock.llamadas.some((c) => c.accion === "insert")).toBe(false);
  });

  it("POST con documento nuevo → crea el huésped y devuelve su id", async () => {
    usar(crearSupabaseMock({ "huespedes.select": { data: null }, "huespedes.insert": { data: { id: 42 } } }));
    const res = await crearHuesped(req("/api/guests", { method: "POST", body: huesped }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 42 });
  });

  it("GET ?numero_identificacion= busca el documento EXACTO", async () => {
    await buscarHuespedes(req("/api/guests?numero_identificacion=%2030123456%20"));
    const [c] = mock.llamadas;
    expect(mock.filtro(c, "eq")).toEqual(["numero_identificacion", "30123456"]);
    expect(mock.filtro(c, "or")).toBeUndefined();
  });

  it("GET ?q= saca comas y paréntesis antes de armar el filtro", async () => {
    await buscarHuespedes(req(`/api/guests?q=${encodeURIComponent("ana),rol.eq.(x")}`));
    const [c] = mock.llamadas;
    const [filtroOr] = mock.filtro(c, "or") as string[];
    expect(filtroOr).toContain("%anarol.eq.x%");
    expect(filtroOr).not.toMatch(/\(|\)/);
    expect(filtroOr.split(",")).toHaveLength(4); // sólo las 4 columnas de búsqueda
  });

  it("GET ?q= vacío (o sólo símbolos) devuelve [] sin consultar", async () => {
    const res = await buscarHuespedes(req(`/api/guests?q=${encodeURIComponent("(),")}`));
    expect(await res.json()).toEqual([]);
    expect(mock.llamadas).toHaveLength(0);
  });
});

describe("GET /api/empleados", () => {
  it("por defecto sólo trae activos", async () => {
    await listarEmpleados(req("/api/empleados"));
    expect(mock.filtro(mock.llamadas[0], "eq")).toEqual(["isActive", true]);
  });

  it("?incluirInactivos=true no filtra por estado (reportes históricos)", async () => {
    await listarEmpleados(req("/api/empleados?incluirInactivos=true"));
    expect(mock.filtro(mock.llamadas[0], "eq")).toBeUndefined();
  });
});
