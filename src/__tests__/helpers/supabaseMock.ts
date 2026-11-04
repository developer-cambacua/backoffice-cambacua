/**
 * Mock mínimo del cliente de Supabase para tests de API routes.
 *
 * - `from(tabla)` devuelve un query builder encadenable y "thenable" (se puede `await`).
 * - Cada consulta queda registrada en `llamadas` con su acción y filtros, en orden.
 * - La respuesta se busca en `respuestas` por "tabla.accion" (ej. "huespedes.insert"),
 *   después por "tabla", y si no hay nada devuelve `{ data: null, error: null }`.
 *   Puede ser un objeto fijo o una función que recibe la consulta.
 */

export type Accion = "select" | "insert" | "update" | "delete" | "upsert";

export interface Consulta {
  tabla: string;
  accion: Accion;
  /** Argumentos de la acción (ej. filas del insert, campos del update) */
  args: unknown[];
  /** Filtros y modificadores en orden: [["eq", "id", 5], ["limit", 1], ...] */
  filtros: [string, ...unknown[]][];
}

export interface Resultado {
  data?: unknown;
  error?: { message: string } | null;
}

type Respuesta = Resultado | ((consulta: Consulta) => Resultado);

const MODIFICADORES = [
  "eq", "neq", "in", "not", "or", "gte", "lte", "gt", "lt", "ilike", "like",
  "order", "limit", "range", "single", "maybeSingle", "select",
] as const;

export function crearSupabaseMock(respuestas: Record<string, Respuesta> = {}) {
  const llamadas: Consulta[] = [];

  const resolver = (c: Consulta): Resultado => {
    const r = respuestas[`${c.tabla}.${c.accion}`] ?? respuestas[c.tabla];
    const res = typeof r === "function" ? r(c) : r;
    return { data: null, error: null, ...(res ?? {}) };
  };

  const builder = (consulta: Consulta) => {
    const b: Record<string, unknown> = {};
    for (const m of MODIFICADORES) {
      b[m] = (...args: unknown[]) => {
        // `.select()` después de insert/update es un modificador, no cambia la acción
        consulta.filtros.push([m, ...args]);
        return b;
      };
    }
    b.then = (onOk: (r: Resultado) => unknown, onError?: (e: unknown) => unknown) =>
      Promise.resolve(resolver(consulta)).then(onOk, onError);
    return b;
  };

  const from = (tabla: string) => {
    const accion = (nombre: Accion) => (...args: unknown[]) => {
      const consulta: Consulta = { tabla, accion: nombre, args, filtros: [] };
      llamadas.push(consulta);
      return builder(consulta);
    };
    return {
      select: accion("select"),
      insert: accion("insert"),
      update: accion("update"),
      delete: accion("delete"),
      upsert: accion("upsert"),
    };
  };

  /** Valor de un filtro registrado, ej. filtro(c, "eq") → ["id", 5] */
  const filtro = (c: Consulta, nombre: string) =>
    c.filtros.find(([m]) => m === nombre)?.slice(1);

  return { cliente: { from } as any, llamadas, filtro };
}

export type SupabaseMock = ReturnType<typeof crearSupabaseMock>;
